import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";

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
