import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { storefront, isShopifyConnected } from "./shopify";

/**
 * Login REAL de clientes vía Customer Account API de Shopify (OAuth 2.0 + PKCE).
 *
 * ENV-GATED: sin `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID` → `customerAccountsEnabled=false`
 * y el sitio sigue enlazando al portal de Shopify (comportamiento actual). Al pegar el
 * Client ID (y registrar los callbacks en el admin) → login propio con sesión httpOnly.
 *
 * Flujo (docs Shopify):
 *  1. /account/login → PKCE + state + nonce en cookies httpOnly → redirect al authorize.
 *  2. /account/callback → valida state, canjea el code por access/refresh token → cookies.
 *  3. getCustomer() (en el header, server) → consulta el Customer y devuelve {name,email}.
 *  4. /account/logout → limpia cookies + end_session_endpoint de Shopify.
 *
 * Endpoints vía DISCOVERY (no hardcodeados): /.well-known/openid-configuration y
 * /.well-known/customer-account-api del dominio de la tienda.
 */

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const CLIENT_ID = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID;
// Opcional: cliente CONFIDENCIAL (con secreto). Sin él, se usa cliente público (PKCE).
const CLIENT_SECRET = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET;
const SCOPE = "openid email customer-account-api:full";

export const customerAccountsEnabled = Boolean(DOMAIN && CLIENT_ID);

// Nombres de cookie (httpOnly). `at`=access token, `rt`=refresh, `exp`=vencimiento(ms),
// `idt`=id_token (para el logout). `pkce/state/nonce`=temporales del handshake.
export const CA_COOKIES = {
  at: "hc_cust_at",
  rt: "hc_cust_rt",
  exp: "hc_cust_exp",
  idt: "hc_cust_idt",
  pkce: "hc_pkce",
  state: "hc_state",
  nonce: "hc_nonce",
} as const;

// ── PKCE / utilidades (Web Crypto) ──────────────────────────────────────────
function b64url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function randomString(n = 32): string {
  const a = new Uint8Array(n);
  crypto.getRandomValues(a);
  return b64url(a);
}
async function codeChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return b64url(new Uint8Array(digest));
}

// ── Discovery (cacheado) ────────────────────────────────────────────────────
const discover = cache(async () => {
  const [oidcRes, caaRes] = await Promise.all([
    fetch(`https://${DOMAIN}/.well-known/openid-configuration`, { next: { revalidate: 3600 } }),
    fetch(`https://${DOMAIN}/.well-known/customer-account-api`, { next: { revalidate: 3600 } }),
  ]);
  const oidc = await oidcRes.json();
  const caa = await caaRes.json();
  return {
    authorizationEndpoint: oidc.authorization_endpoint as string,
    tokenEndpoint: oidc.token_endpoint as string,
    logoutEndpoint: oidc.end_session_endpoint as string,
    // El discovery de la Customer Account API expone el endpoint GraphQL (con versión).
    graphqlApi: (caa.graphql_api ?? caa.graphqlApi ?? caa.graphql_endpoint) as string,
  };
});

// ── OAuth ───────────────────────────────────────────────────────────────────
export async function getAuthorize(redirectUri: string) {
  const { authorizationEndpoint } = await discover();
  const verifier = randomString(32);
  const state = randomString(16);
  const nonce = randomString(16);
  const url = new URL(authorizationEndpoint);
  url.searchParams.set("client_id", CLIENT_ID!);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", SCOPE);
  url.searchParams.set("state", state);
  url.searchParams.set("nonce", nonce);
  url.searchParams.set("code_challenge", await codeChallenge(verifier));
  url.searchParams.set("code_challenge_method", "S256");
  return { url: url.toString(), verifier, state, nonce };
}

type TokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  id_token?: string;
};

async function tokenRequest(params: Record<string, string>): Promise<TokenResponse> {
  const { tokenEndpoint } = await discover();
  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
  };
  // Cliente confidencial (si hay secreto) → Basic auth; público → solo client_id en el body.
  if (CLIENT_SECRET) headers["Authorization"] = "Basic " + btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
  const res = await fetch(tokenEndpoint, {
    method: "POST",
    headers,
    body: new URLSearchParams(params).toString(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`token ${res.status}: ${await res.text()}`);
  return (await res.json()) as TokenResponse;
}

export function exchangeCode(code: string, verifier: string, redirectUri: string) {
  return tokenRequest({
    grant_type: "authorization_code",
    client_id: CLIENT_ID!,
    redirect_uri: redirectUri,
    code,
    code_verifier: verifier,
  });
}

export function refresh(refreshToken: string) {
  return tokenRequest({
    grant_type: "refresh_token",
    client_id: CLIENT_ID!,
    refresh_token: refreshToken,
  });
}

export async function getLogoutUrl(idToken: string | undefined, postLogoutRedirect: string) {
  const { logoutEndpoint } = await discover();
  const url = new URL(logoutEndpoint);
  if (idToken) url.searchParams.set("id_token_hint", idToken);
  url.searchParams.set("post_logout_redirect_uri", postLogoutRedirect);
  return url.toString();
}

// ── Cliente actual (para el header) ─────────────────────────────────────────
export type CustomerInfo = { name: string; email: string };

/**
 * Cliente logeado, o null. Lee el access token de la cookie httpOnly y consulta el
 * Customer Account API. NO refresca en render (Next no permite escribir cookies al
 * renderizar) → si el token venció, devuelve null (el refresh vive en el callback;
 * un middleware de refresh queda como mejora). Cacheado por request.
 */
export const getCustomer = cache(async (): Promise<CustomerInfo | null> => {
  if (!customerAccountsEnabled) return null;
  const jar = await cookies();
  const token = jar.get(CA_COOKIES.at)?.value;
  const exp = Number(jar.get(CA_COOKIES.exp)?.value ?? "0");
  if (!token || (exp && exp < Date.now())) return null;
  try {
    const { graphqlApi } = await discover();
    const res = await fetch(graphqlApi, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: token },
      body: JSON.stringify({
        query: `{ customer { firstName lastName emailAddress { emailAddress } } }`,
      }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    const c = json?.data?.customer;
    if (!c) return null;
    const name = [c.firstName, c.lastName].filter(Boolean).join(" ").trim();
    return { name, email: c.emailAddress?.emailAddress ?? "" };
  } catch {
    return null;
  }
});

// ── Datos completos de la cuenta (página /cuenta) ───────────────────────────
export type OrderItem = {
  title: string;
  quantity: number;
  variantId: string | null;
  image: string | null;
};
export type CustomerOrder = {
  id: string;
  name: string;
  processedAt: string;
  financialStatus: string | null;
  total: { amount: string; currencyCode: string } | null;
  statusUrl: string | null;
  lineItems: OrderItem[];
};
export type CustomerAddress = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  company: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  zip: string | null;
  phoneNumber: string | null;
  territoryCode: string | null; // país (ISO 3166-1)
  zoneCode: string | null; // estado/provincia (ISO 3166-2)
  formatted: string[];
  isDefault: boolean;
};
export type CustomerAccountData = {
  profile: { name: string; firstName: string | null; lastName: string | null; email: string; phone: string | null };
  addresses: CustomerAddress[];
  orders: CustomerOrder[];
};
/** null = no hay sesión (→ login). {error:true} = sesión OK pero la query falló. */
export type AccountResult = CustomerAccountData | { error: true };

const ADDR_FIELDS = `
  id firstName lastName company address1 address2 city zip phoneNumber territoryCode zoneCode
  formatted(withName: true)`;
const ACCOUNT_QUERY = `query CustomerAccount {
  customer {
    firstName
    lastName
    displayName
    emailAddress { emailAddress }
    phoneNumber { phoneNumber }
    defaultAddress { id }
    addresses(first: 10) { edges { node { ${ADDR_FIELDS} } } }
    orders(first: 15, sortKey: PROCESSED_AT, reverse: true) {
      edges { node {
        id
        name
        processedAt
        financialStatus
        totalPrice { amount currencyCode }
        statusPageUrl
        lineItems(first: 6) {
          edges { node { title quantity variantId image { url } } }
        }
      } }
    }
  }
}`;

type GqlMoney = { amount: string; currencyCode: string } | null;
type GqlAddrNode = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  company?: string | null;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  zip?: string | null;
  phoneNumber?: string | null;
  territoryCode?: string | null;
  zoneCode?: string | null;
  formatted?: string[];
};
type GqlOrderNode = {
  id: string;
  name: string;
  processedAt: string;
  financialStatus: string | null;
  totalPrice: GqlMoney;
  statusPageUrl: string | null;
  lineItems?: {
    edges?: {
      node: {
        title: string;
        quantity: number;
        variantId?: string | null;
        image?: { url?: string } | null;
      };
    }[];
  };
};
type GqlCustomer = {
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  emailAddress?: { emailAddress?: string } | null;
  phoneNumber?: { phoneNumber?: string } | null;
  defaultAddress?: { id?: string } | null;
  addresses?: { edges?: { node: GqlAddrNode }[] };
  orders?: { edges?: { node: GqlOrderNode }[] };
};

export const getCustomerAccount = cache(async (): Promise<AccountResult | null> => {
  if (!customerAccountsEnabled) return null;
  const jar = await cookies();
  const token = jar.get(CA_COOKIES.at)?.value;
  const exp = Number(jar.get(CA_COOKIES.exp)?.value ?? "0");
  if (!token || (exp && exp < Date.now())) return null;
  try {
    const { graphqlApi } = await discover();
    const res = await fetch(graphqlApi, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: token },
      body: JSON.stringify({ query: ACCOUNT_QUERY }),
      cache: "no-store",
    });
    const json = (await res.json()) as {
      data?: { customer?: GqlCustomer };
      errors?: unknown;
    };
    if (json.errors) {
      console.error("[getCustomerAccount] GraphQL errors:", JSON.stringify(json.errors));
      return { error: true };
    }
    const c = json.data?.customer;
    if (!c) return null;
    const name =
      c.displayName || [c.firstName, c.lastName].filter(Boolean).join(" ").trim();
    const defaultId = c.defaultAddress?.id ?? null;
    const addresses: CustomerAddress[] = (c.addresses?.edges ?? [])
      .map((e) => e.node)
      .filter((a): a is GqlAddrNode => Boolean(a?.id))
      .map((a) => ({
        id: a.id,
        firstName: a.firstName ?? null,
        lastName: a.lastName ?? null,
        company: a.company ?? null,
        address1: a.address1 ?? null,
        address2: a.address2 ?? null,
        city: a.city ?? null,
        zip: a.zip ?? null,
        phoneNumber: a.phoneNumber ?? null,
        territoryCode: a.territoryCode ?? null,
        zoneCode: a.zoneCode ?? null,
        formatted: a.formatted ?? [],
        isDefault: a.id === defaultId,
      }))
      // La dirección predeterminada primero.
      .sort((x, y) => Number(y.isDefault) - Number(x.isDefault));
    return {
      profile: {
        name: name || "",
        firstName: c.firstName ?? null,
        lastName: c.lastName ?? null,
        email: c.emailAddress?.emailAddress ?? "",
        phone: c.phoneNumber?.phoneNumber ?? null,
      },
      addresses,
      orders: (c.orders?.edges ?? []).map((e) => {
        const o = e.node;
        return {
          id: o.id,
          name: o.name,
          processedAt: o.processedAt,
          financialStatus: o.financialStatus ?? null,
          total: o.totalPrice ?? null,
          statusUrl: o.statusPageUrl ?? null,
          lineItems: (o.lineItems?.edges ?? []).map((le) => ({
            title: le.node.title,
            quantity: le.node.quantity,
            variantId: le.node.variantId ?? null,
            image: le.node.image?.url ?? null,
          })),
        };
      }),
    };
  } catch (e) {
    console.error("[getCustomerAccount] threw:", e);
    return { error: true };
  }
});

// ── Detalle de un pedido (página /cuenta/pedido/[id]) ────────────────────────
export type OrderDetailItem = {
  title: string;
  quantity: number;
  variantId: string | null;
  handle: string | null;
  image: string | null;
  lineTotal: { amount: string; currencyCode: string } | null;
};
export type OrderTracking = { number: string | null; url: string | null; company: string | null };
export type OrderDetail = {
  id: string;
  name: string;
  processedAt: string;
  financialStatus: string | null;
  statusUrl: string | null;
  total: { amount: string; currencyCode: string } | null;
  subtotal: { amount: string; currencyCode: string } | null;
  shipping: { amount: string; currencyCode: string } | null;
  tax: { amount: string; currencyCode: string } | null;
  shippingAddress: string[] | null;
  fulfillmentStatus: string | null;
  shipmentStatus: string | null;
  tracking: OrderTracking[];
  items: OrderDetailItem[];
};

// Resuelve variantId (gid ProductVariant) → handle del producto vía Storefront API,
// para poder enlazar cada renglón del pedido a su ficha /producto/[handle].
const Q_VARIANT_HANDLES = `query($ids:[ID!]!){ nodes(ids:$ids){ ... on ProductVariant { id product { handle } } } }`;
async function resolveHandles(variantIds: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (!isShopifyConnected || variantIds.length === 0) return map;
  try {
    const d = await storefront<{ nodes: ({ id?: string; product?: { handle?: string } } | null)[] }>(
      Q_VARIANT_HANDLES,
      { ids: variantIds },
      { cache: "no-store" },
    );
    for (const n of d.nodes ?? []) if (n?.id && n.product?.handle) map.set(n.id, n.product.handle);
  } catch {
    /* sin handles → los renglones no se enlazan (degradación limpia) */
  }
  return map;
}
/** null = no sesión / pedido no encontrado. {error} = query falló (TEMP: raw para debug). */
export type OrderDetailResult = OrderDetail | { error: string } | null;

const ORDER_QUERY = `query OrderDetail($id: ID!) {
  order(id: $id) {
    id
    name
    processedAt
    financialStatus
    statusPageUrl
    totalPrice { amount currencyCode }
    subtotal { amount currencyCode }
    totalShipping { amount currencyCode }
    totalTax { amount currencyCode }
    shippingAddress { formatted }
    fulfillments(first: 5) {
      edges { node {
        status
        latestShipmentStatus
        trackingInformation { number url company }
      } }
    }
    lineItems(first: 50) {
      edges { node {
        title
        quantity
        variantId
        image { url }
        currentTotalPrice { amount currencyCode }
      } }
    }
  }
}`;

export const getOrderDetail = cache(async (id: string): Promise<OrderDetailResult> => {
  if (!customerAccountsEnabled) return null;
  const jar = await cookies();
  const token = jar.get(CA_COOKIES.at)?.value;
  const exp = Number(jar.get(CA_COOKIES.exp)?.value ?? "0");
  if (!token || (exp && exp < Date.now())) return null;
  try {
    const { graphqlApi } = await discover();
    const res = await fetch(graphqlApi, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: token },
      body: JSON.stringify({ query: ORDER_QUERY, variables: { id } }),
      cache: "no-store",
    });
    const json = (await res.json()) as { data?: { order?: Record<string, unknown> }; errors?: unknown };
    if (json.errors) return { error: JSON.stringify(json.errors).slice(0, 800) }; // TEMP debug
    const o = json.data?.order as
      | {
          id: string;
          name: string;
          processedAt: string;
          financialStatus: string | null;
          statusPageUrl: string | null;
          totalPrice: { amount: string; currencyCode: string } | null;
          subtotal: { amount: string; currencyCode: string } | null;
          totalShipping: { amount: string; currencyCode: string } | null;
          totalTax: { amount: string; currencyCode: string } | null;
          shippingAddress: { formatted?: string[] } | null;
          fulfillments?: {
            edges?: {
              node: {
                status?: string | null;
                latestShipmentStatus?: string | null;
                trackingInformation?: { number?: string; url?: string; company?: string }[];
              };
            }[];
          };
          lineItems?: {
            edges?: {
              node: {
                title: string;
                quantity: number;
                variantId?: string | null;
                image?: { url?: string } | null;
                currentTotalPrice?: { amount: string; currencyCode: string } | null;
              };
            }[];
          };
        }
      | null
      | undefined;
    if (!o) return null;
    const ful = (o.fulfillments?.edges ?? []).map((e) => e.node);
    const tracking: OrderTracking[] = ful.flatMap((f) =>
      (f.trackingInformation ?? []).map((t) => ({
        number: t.number ?? null,
        url: t.url ?? null,
        company: t.company ?? null,
      })),
    );
    const rawItems = (o.lineItems?.edges ?? []).map((e) => e.node);
    const variantIds = [...new Set(rawItems.map((n) => n.variantId).filter(Boolean))] as string[];
    const handleByVariant = await resolveHandles(variantIds);
    return {
      id: o.id,
      name: o.name,
      processedAt: o.processedAt,
      financialStatus: o.financialStatus ?? null,
      statusUrl: o.statusPageUrl ?? null,
      total: o.totalPrice ?? null,
      subtotal: o.subtotal ?? null,
      shipping: o.totalShipping ?? null,
      tax: o.totalTax ?? null,
      shippingAddress: o.shippingAddress?.formatted ?? null,
      fulfillmentStatus: ful[0]?.status ?? null,
      shipmentStatus: ful.map((f) => f.latestShipmentStatus).find(Boolean) ?? null,
      tracking,
      items: rawItems.map((n) => ({
        title: n.title,
        quantity: n.quantity,
        variantId: n.variantId ?? null,
        handle: (n.variantId && handleByVariant.get(n.variantId)) || null,
        image: n.image?.url ?? null,
        lineTotal: n.currentTotalPrice ?? null,
      })),
    };
  } catch (e) {
    return { error: `threw: ${e instanceof Error ? e.message : String(e)}` };
  }
});

// ── Mutaciones de la cuenta (Fase B: editar perfil y direcciones) ────────────
export type MutationResult = { ok: boolean; error?: string };
export type AddressInput = {
  firstName?: string;
  lastName?: string;
  company?: string;
  address1?: string;
  address2?: string;
  city?: string;
  zip?: string;
  phoneNumber?: string;
  territoryCode?: string;
  zoneCode?: string;
};

// Ejecuta una mutación autenticada del Customer Account API. Lanza si no hay sesión.
async function caMutate(
  query: string,
  variables: Record<string, unknown>,
): Promise<{ data?: Record<string, { userErrors?: { field?: string[]; message?: string }[] }>; errors?: unknown }> {
  const jar = await cookies();
  const token = jar.get(CA_COOKIES.at)?.value;
  const exp = Number(jar.get(CA_COOKIES.exp)?.value ?? "0");
  if (!token || (exp && exp < Date.now())) throw new Error("NO_SESSION");
  const { graphqlApi } = await discover();
  const res = await fetch(graphqlApi, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: token },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  return res.json();
}

// Normaliza el resultado: GraphQL errors o el primer userError → mensaje; si no, ok.
function settle(
  json: { data?: Record<string, { userErrors?: { message?: string }[] }>; errors?: unknown },
  root: string,
): MutationResult {
  if (json.errors) return { ok: false, error: "No se pudo completar la operación. Intenta de nuevo." };
  const ue = json.data?.[root]?.userErrors;
  if (ue && ue.length > 0) return { ok: false, error: ue[0]?.message || "Revisa los datos e intenta de nuevo." };
  return { ok: true };
}

const M_PROFILE = `mutation($input: CustomerUpdateInput!) {
  customerUpdate(input: $input) { customer { id } userErrors { field message } }
}`;
export async function updateCustomerProfile(firstName: string, lastName: string): Promise<MutationResult> {
  try {
    const json = await caMutate(M_PROFILE, { input: { firstName, lastName } });
    return settle(json, "customerUpdate");
  } catch (e) {
    return { ok: false, error: e instanceof Error && e.message === "NO_SESSION" ? "Tu sesión expiró." : "Error de red." };
  }
}

const M_ADDR_CREATE = `mutation($address: CustomerAddressInput!, $defaultAddress: Boolean) {
  customerAddressCreate(address: $address, defaultAddress: $defaultAddress) {
    customerAddress { id } userErrors { field message code }
  }
}`;
export async function addCustomerAddress(input: AddressInput, makeDefault: boolean): Promise<MutationResult> {
  try {
    const json = await caMutate(M_ADDR_CREATE, { address: input, defaultAddress: makeDefault });
    return settle(json, "customerAddressCreate");
  } catch (e) {
    return { ok: false, error: e instanceof Error && e.message === "NO_SESSION" ? "Tu sesión expiró." : "Error de red." };
  }
}

const M_ADDR_UPDATE = `mutation($addressId: ID!, $address: CustomerAddressInput, $defaultAddress: Boolean) {
  customerAddressUpdate(addressId: $addressId, address: $address, defaultAddress: $defaultAddress) {
    customerAddress { id } userErrors { field message code }
  }
}`;
export async function editCustomerAddress(
  id: string,
  input: AddressInput,
  makeDefault: boolean,
): Promise<MutationResult> {
  try {
    const json = await caMutate(M_ADDR_UPDATE, { addressId: id, address: input, defaultAddress: makeDefault });
    return settle(json, "customerAddressUpdate");
  } catch (e) {
    return { ok: false, error: e instanceof Error && e.message === "NO_SESSION" ? "Tu sesión expiró." : "Error de red." };
  }
}

// Marcar como predeterminada sin reenviar todos los campos (address es opcional en update).
export async function setDefaultAddress(id: string): Promise<MutationResult> {
  try {
    const json = await caMutate(M_ADDR_UPDATE, { addressId: id, defaultAddress: true });
    return settle(json, "customerAddressUpdate");
  } catch (e) {
    return { ok: false, error: e instanceof Error && e.message === "NO_SESSION" ? "Tu sesión expiró." : "Error de red." };
  }
}

const M_ADDR_DELETE = `mutation($addressId: ID!) {
  customerAddressDelete(addressId: $addressId) { deletedAddressId userErrors { field message code } }
}`;
export async function removeCustomerAddress(id: string): Promise<MutationResult> {
  try {
    const json = await caMutate(M_ADDR_DELETE, { addressId: id });
    return settle(json, "customerAddressDelete");
  } catch (e) {
    return { ok: false, error: e instanceof Error && e.message === "NO_SESSION" ? "Tu sesión expiró." : "Error de red." };
  }
}
