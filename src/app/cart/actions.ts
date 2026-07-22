"use server";
import * as api from "@/lib/shopify-cart";
import { isShopifyConnected } from "@/lib/shopify";
import type { CartActionResult } from "@/lib/cart-types";

const VARIANT_RE = /^gid:\/\/shopify\/ProductVariant\/\d+$/;
const LINE_RE = /^gid:\/\/shopify\/CartLine\//;
const DISABLED: CartActionResult = {
  ok: true,
  cart: null,
  notices: [{ code: "CART_DISABLED", message: "El carrito estará disponible al conectar la tienda." }],
};
const clampQty = (q: number) => Math.min(99, Math.max(1, Math.floor(Number.isFinite(q) ? q : 1)));

function netFail(): CartActionResult {
  return {
    ok: false,
    cart: null,
    notices: [{ code: "NETWORK", message: "No pudimos actualizar el carrito. Reintenta." }],
  };
}

export async function addToCartAction(variantId: string, quantity = 1): Promise<CartActionResult> {
  if (!isShopifyConnected) return DISABLED;
  if (!VARIANT_RE.test(variantId))
    return { ok: false, cart: null, notices: [{ code: "INVALID_INPUT", message: "Producto no válido." }] };
  try {
    const r = await api.addToCart(variantId, clampQty(quantity));
    return {
      ok: r.notices.every((n) => n.code !== "MERCHANDISE_UNAVAILABLE"),
      cart: r.cart,
      notices: r.notices,
      recovered: r.recovered,
    };
  } catch (e) {
    console.error("[cart] add", e);
    return netFail();
  }
}

export async function updateLineAction(lineId: string, quantity: number): Promise<CartActionResult> {
  if (!isShopifyConnected) return DISABLED;
  if (!LINE_RE.test(lineId))
    return { ok: false, cart: null, notices: [{ code: "INVALID_INPUT", message: "Línea no válida." }] };
  try {
    const q = Number.isFinite(quantity) ? Math.floor(quantity) : 0; // 0 → se convierte en remove
    const r = await api.updateLine(lineId, q);
    return { ok: true, cart: r.cart, notices: r.notices, recovered: r.recovered };
  } catch (e) {
    console.error("[cart] update", e);
    return netFail();
  }
}

export async function removeLineAction(lineId: string): Promise<CartActionResult> {
  if (!isShopifyConnected) return DISABLED;
  if (!LINE_RE.test(lineId))
    return { ok: false, cart: null, notices: [{ code: "INVALID_INPUT", message: "Línea no válida." }] };
  try {
    const r = await api.removeLine(lineId);
    return { ok: true, cart: r.cart, notices: r.notices, recovered: r.recovered };
  } catch (e) {
    console.error("[cart] remove", e);
    return netFail();
  }
}

/** Re-lee el carrito vivo al momento del clic; devuelve el checkoutUrl fresco. */
export async function getCheckoutUrlAction(): Promise<{ url: string | null; result: CartActionResult }> {
  if (!isShopifyConnected) return { url: null, result: DISABLED };
  try {
    const cart = await api.getCart();
    if (!cart || cart.totalQuantity === 0)
      return {
        url: null,
        result: { ok: false, cart, notices: [{ code: "UNKNOWN", message: "Tu carrito está vacío." }] },
      };
    const blocked = cart.lines.some(
      (l) => !l.availableForSale || (l.quantityAvailable != null && l.quantity > l.quantityAvailable),
    );
    if (blocked)
      return {
        url: null,
        result: {
          ok: false,
          cart,
          notices: [{ code: "OUT_OF_STOCK", message: "Ajusta las cantidades sin stock antes de pagar." }],
        },
      };
    return { url: cart.checkoutUrl, result: { ok: true, cart, notices: [] } };
  } catch (e) {
    console.error("[cart] checkout", e);
    return { url: null, result: netFail() };
  }
}
