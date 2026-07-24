/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";
import { cookies } from "next/headers";
import { storefront, isShopifyConnected } from "./shopify";
import type { Cart, CartLine, CartNotice } from "./cart-types";

const CART_COOKIE = "hercan_cart";
const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 10; // 10 días (los carritos de Shopify persisten ~10d)

export class CartTransportError extends Error {}

export interface CartMutationResult {
  cart: Cart | null;
  notices: CartNotice[];
  recovered: boolean;
}

// ---- GraphQL (un fragment compartido mantiene idéntica la forma de la línea) ----
const CART_FRAGMENT = `
fragment CartFields on Cart {
  id checkoutUrl totalQuantity
  cost {
    subtotalAmount { amount currencyCode }
    totalAmount { amount currencyCode }
    totalTaxAmount { amount currencyCode }
  }
  lines(first: 100) {
    nodes {
      id quantity
      cost { amountPerQuantity { amount currencyCode } totalAmount { amount currencyCode } }
      merchandise { ... on ProductVariant {
        id title sku availableForSale quantityAvailable
        price { amount currencyCode }
        image { url }
        product { title handle }
      } }
    }
  }
}`;
const Q_CART = `query Cart($id:ID!){ cart(id:$id){ ...CartFields } } ${CART_FRAGMENT}`;
const M_CREATE = `mutation($lines:[CartLineInput!]){ cartCreate(input:{lines:$lines}){ cart{...CartFields} userErrors{field message} } } ${CART_FRAGMENT}`;
const M_ADD = `mutation($cartId:ID!,$lines:[CartLineInput!]!){ cartLinesAdd(cartId:$cartId,lines:$lines){ cart{...CartFields} userErrors{field message} } } ${CART_FRAGMENT}`;
const M_UPDATE = `mutation($cartId:ID!,$lines:[CartLineUpdateInput!]!){ cartLinesUpdate(cartId:$cartId,lines:$lines){ cart{...CartFields} userErrors{field message} } } ${CART_FRAGMENT}`;
const M_REMOVE = `mutation($cartId:ID!,$lineIds:[ID!]!){ cartLinesRemove(cartId:$cartId,lineIds:$lineIds){ cart{...CartFields} userErrors{field message} } } ${CART_FRAGMENT}`;

// ---- transporte: no-store + timeout; errores de transporte lanzan, userErrors se devuelven ----
async function call<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  try {
    return await storefront<T>(query, variables, {
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch (e) {
    throw new CartTransportError((e as Error).message);
  }
}

// ---- mapeo (descarta líneas cuyo merchandise no resolvió a variante) ----
function mapCart(raw: any): Cart | null {
  if (!raw) return null;
  const lines: CartLine[] = (raw.lines?.nodes ?? [])
    .filter((n: any) => n.merchandise?.id)
    .map((n: any) => {
      const m = n.merchandise;
      return {
        id: n.id,
        quantity: n.quantity,
        merchandiseId: m.id,
        productTitle: m.product?.title ?? m.title ?? "",
        variantTitle: m.title ?? "",
        handle: m.product?.handle ?? "",
        sku: m.sku ?? null,
        unitPrice: n.cost.amountPerQuantity ?? m.price, // precio unitario autoritativo (respeta volumen/descuentos)
        lineTotal: n.cost.totalAmount,
        image: m.image?.url ?? null,
        availableForSale: m.availableForSale,
        quantityAvailable: m.quantityAvailable ?? null,
      };
    });
  return {
    id: raw.id,
    checkoutUrl: raw.checkoutUrl,
    totalQuantity: raw.totalQuantity ?? 0,
    subtotal: raw.cost.subtotalAmount,
    total: raw.cost.totalAmount,
    currencyCode: raw.cost.subtotalAmount.currencyCode,
    lines,
  };
}

// ---- cookie ----
async function readCartId() {
  return (await cookies()).get(CART_COOKIE)?.value ?? null;
}
async function writeCartId(id: string) {
  (await cookies()).set(CART_COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: CART_COOKIE_MAX_AGE,
  });
}
async function clearCartId() {
  try {
    (await cookies()).delete(CART_COOKIE);
  } catch {
    // Llamado durante el render de un Server Component (getCart en el layout),
    // donde mutar cookies lanza en Next 16. El id viejo es inofensivo: la
    // próxima Server Action (addToCart) lo limpia y recrea el carrito.
  }
}

function noticesFromUserErrors(errs: any[]): CartNotice[] {
  return (errs ?? []).map((e) => ({
    code: "MERCHANDISE_UNAVAILABLE" as const,
    message: e.message || "No disponible.",
  }));
}

// ---- READ (recupera si expiró) ----
export async function getCart(): Promise<Cart | null> {
  if (!isShopifyConnected) return null;
  const id = await readCartId();
  if (!id) return null;
  const d = await call<{ cart: any }>(Q_CART, { id });
  if (!d.cart) {
    await clearCartId();
    return null;
  }
  return mapCart(d.cart);
}

// ---- ADD (crea al primer add, recupera si expiró) ----
export async function addToCart(variantId: string, quantity: number): Promise<CartMutationResult> {
  if (!isShopifyConnected) return { cart: null, notices: [], recovered: false };
  const lines = [{ merchandiseId: variantId, quantity }];
  const id = await readCartId();
  if (id) {
    const d = await call<{ cartLinesAdd: { cart: any; userErrors: any[] } }>(M_ADD, {
      cartId: id,
      lines,
    });
    if (d.cartLinesAdd.cart) return finalize(d.cartLinesAdd.cart, d.cartLinesAdd.userErrors, false);
    await clearCartId(); // expiró → recrear abajo
  }
  const c = await call<{ cartCreate: { cart: any; userErrors: any[] } }>(M_CREATE, { lines });
  const cart = c.cartCreate.cart;
  if (cart) await writeCartId(cart.id);
  return finalize(cart, c.cartCreate.userErrors, Boolean(id));
}

// Disponibilidad de variantes (para "Volver a pedir": no agregar productos agotados).
const Q_VARIANTS = `query($ids:[ID!]!){ nodes(ids:$ids){ ... on ProductVariant {
  id availableForSale title product { title }
} } }`;

/**
 * "Volver a pedir": verifica el stock de las variantes del pedido, agrega SOLO las
 * disponibles (en un batch) y reporta las agotadas en `skipped` para avisar al cliente.
 * Así una recompra con 1 producto agotado no falla ni mete al carrito algo no comprable.
 */
export async function reorderToCart(
  items: { variantId: string; quantity: number }[],
): Promise<CartMutationResult & { skipped: string[]; added: number }> {
  if (!isShopifyConnected || items.length === 0)
    return { cart: await getCart(), notices: [], recovered: false, skipped: [], added: 0 };

  // 1) Consulta disponibilidad. Si el check falla, se intenta agregar todo (no bloquear).
  const ids = [...new Set(items.map((i) => i.variantId))];
  const avail = new Map<string, { available: boolean; title: string }>();
  try {
    const d = await call<{
      nodes: ({ id: string; availableForSale: boolean; title?: string; product?: { title?: string } } | null)[];
    }>(Q_VARIANTS, { ids });
    for (const n of d.nodes ?? [])
      if (n?.id) avail.set(n.id, { available: n.availableForSale, title: n.product?.title ?? n.title ?? "Producto" });
  } catch {
    /* sin check → intentamos agregar todo */
  }

  const toAdd = items.filter((i) => avail.get(i.variantId)?.available !== false);
  const skipped = items
    .filter((i) => avail.get(i.variantId)?.available === false)
    .map((i) => avail.get(i.variantId)?.title ?? "Producto");

  if (toAdd.length === 0)
    return { cart: await getCart(), notices: [], recovered: false, skipped, added: 0 };

  // 2) Agrega las disponibles en un solo cartLinesAdd (crea el carrito si hace falta).
  const lines = toAdd.map((i) => ({ merchandiseId: i.variantId, quantity: i.quantity }));
  let raw: any = null;
  let userErrors: any[] = [];
  let recovered = false;
  const id = await readCartId();
  if (id) {
    const d = await call<{ cartLinesAdd: { cart: any; userErrors: any[] } }>(M_ADD, { cartId: id, lines });
    raw = d.cartLinesAdd.cart;
    userErrors = d.cartLinesAdd.userErrors;
    if (!raw) {
      await clearCartId();
      recovered = true;
    }
  }
  if (!raw) {
    const c = await call<{ cartCreate: { cart: any; userErrors: any[] } }>(M_CREATE, { lines });
    raw = c.cartCreate.cart;
    userErrors = c.cartCreate.userErrors;
    if (raw) await writeCartId(raw.id);
  }
  return { cart: mapCart(raw), notices: noticesFromUserErrors(userErrors), recovered, skipped, added: toAdd.length };
}

export async function updateLine(lineId: string, quantity: number): Promise<CartMutationResult> {
  if (!isShopifyConnected) return { cart: null, notices: [], recovered: false };
  if (quantity <= 0) return removeLine(lineId);
  const id = await readCartId();
  if (!id) return recoveredEmpty();
  const d = await call<{ cartLinesUpdate: { cart: any; userErrors: any[] } }>(M_UPDATE, {
    cartId: id,
    lines: [{ id: lineId, quantity }],
  });
  if (!d.cartLinesUpdate.cart) {
    await clearCartId();
    return recoveredEmpty();
  }
  return finalize(d.cartLinesUpdate.cart, d.cartLinesUpdate.userErrors, false);
}

export async function removeLine(lineId: string): Promise<CartMutationResult> {
  if (!isShopifyConnected) return { cart: null, notices: [], recovered: false };
  const id = await readCartId();
  if (!id) return recoveredEmpty();
  const d = await call<{ cartLinesRemove: { cart: any; userErrors: any[] } }>(M_REMOVE, {
    cartId: id,
    lineIds: [lineId],
  });
  if (!d.cartLinesRemove.cart) {
    await clearCartId();
    return recoveredEmpty();
  }
  return finalize(d.cartLinesRemove.cart, d.cartLinesRemove.userErrors, false);
}

function recoveredEmpty(): CartMutationResult {
  return {
    cart: null,
    notices: [{ code: "CART_RECOVERED", message: "Tu carrito expiró; empezamos uno nuevo." }],
    recovered: true,
  };
}

function finalize(rawCart: any, userErrors: any[], recovered: boolean): CartMutationResult {
  const cart = mapCart(rawCart);
  const notices = noticesFromUserErrors(userErrors);
  if (recovered)
    notices.push({ code: "CART_RECOVERED", message: "Tu carrito anterior expiró; creamos uno nuevo." });
  for (const l of cart?.lines ?? []) {
    if (!l.availableForSale)
      notices.push({ code: "OUT_OF_STOCK", message: `Sin stock: ${l.productTitle}`, lineId: l.id });
    else if (l.quantityAvailable != null && l.quantity > l.quantityAvailable)
      notices.push({
        code: "OUT_OF_STOCK",
        message: `Solo ${l.quantityAvailable} disponibles: ${l.productTitle}`,
        lineId: l.id,
      });
  }
  return { cart, notices, recovered };
}
