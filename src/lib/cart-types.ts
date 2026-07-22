export interface Money {
  amount: string; // Shopify decimal string, e.g. "123.45"; parse only at format time
  currencyCode: string;
}

export interface CartLine {
  id: string; // CartLine GID — required for update/remove
  quantity: number;
  merchandiseId: string; // ProductVariant GID
  productTitle: string;
  variantTitle: string; // "Default Title" → hide
  handle: string; // link back to /producto/[handle]
  sku: string | null;
  unitPrice: Money; // variant price, sin IVA
  lineTotal: Money;
  image: string | null;
  availableForSale: boolean;
  quantityAvailable: number | null;
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  subtotal: Money; // sin IVA
  total: Money;
  currencyCode: string;
  lines: CartLine[];
}

export type CartNoticeCode =
  | "OUT_OF_STOCK"
  | "QTY_CLAMPED"
  | "LINE_NOT_FOUND"
  | "CART_RECOVERED"
  | "MERCHANDISE_UNAVAILABLE"
  | "NETWORK"
  | "CART_DISABLED"
  | "INVALID_INPUT"
  | "UNKNOWN";

export interface CartNotice {
  code: CartNoticeCode;
  message: string; // localized es-MX
  lineId?: string;
}

/** Uniform result of every server action. Never throws to the client. */
export interface CartActionResult {
  ok: boolean;
  cart: Cart | null; // authoritative cart after op; null in mock/disabled
  notices: CartNotice[];
  recovered?: boolean;
}
