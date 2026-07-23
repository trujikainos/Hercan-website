import type { Availability, Product } from "@/lib/types";
import type { Money } from "@/lib/cart-types";

export function AvailabilityBadge({ value }: { value: Availability }) {
  const inStock = value === "En stock";
  const cls = inStock
    ? "bg-[#eaf3de] text-[#2e7d46]"
    : "bg-[#faeeda] text-[#b25e00]";
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs ${cls}`}>
      {value}
    </span>
  );
}

type StockTone = "ok" | "low" | "back";

/**
 * Estado de stock para mostrar en la tienda.
 * - stock rastreado y >5 → "En stock"
 * - stock rastreado 1–5 → "Pocas piezas: N" (urgencia)
 * - stock rastreado <=0 → "Sobre pedido" (política CONTINUE: sigue siendo comprable)
 * - stock null (no rastreado) → según disponibilidad de la variante
 */
export function stockInfo(product: Product): {
  units: number | null;
  label: string;
  tone: StockTone;
} {
  const q = product.stock ?? null;
  if (q != null && q > 5) return { units: q, label: `${q} piezas`, tone: "ok" };
  if (q != null && q >= 1)
    return { units: q, label: q === 1 ? "Última pieza" : `Solo ${q} piezas`, tone: "low" };
  // Con política DENY, stock <= 0 = agotado (no comprable en línea → se solicita).
  if (q != null && q <= 0) return { units: 0, label: "Agotado", tone: "back" };
  // Stock desconocido (variante sin rastreo o modo mock): según disponibilidad.
  return {
    units: null,
    label: product.variantAvailable ? "Disponible" : "Agotado",
    tone: "back",
  };
}

/** Quita el sufijo "[Marca]" del título (ya se muestra la marca aparte). */
export function displayTitle(title: string): string {
  return title.replace(/\s*\[[^\]]+\]\s*$/, "").trim();
}

const STOCK_TONE_CLS: Record<StockTone, string> = {
  ok: "bg-[#eaf3de] text-[#2e7d46]",
  low: "bg-[#faeeda] text-[#b25e00]",
  back: "bg-[#e9eaec] text-[#0e3e60]",
};

export function StockBadge({ product }: { product: Product }) {
  const s = stockInfo(product);
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs ${STOCK_TONE_CLS[s.tone]}`}
    >
      {s.label}
    </span>
  );
}

// Formatea con Intl; si `currency` no es un código ISO válido (dato inesperado de
// Shopify), Intl lanza RangeError → se cae a "<código> <monto>" en vez de romper
// el render de la tarjeta/ficha.
function money(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function formatPrice(product: Product): string {
  if (product.price == null) return "US$ —";
  return money(product.price, product.currency);
}

export function formatMoney(m: Money): string {
  const amount = parseFloat(m.amount);
  if (!Number.isFinite(amount)) return "US$ —";
  return money(amount, m.currencyCode);
}

// ¿El precio aún no está cargado? (null/no numérico o <= 0). En B2B industrial un
// precio 0 = "por cotizar", no gratis → se muestra "A confirmar".
export function isPriceTBD(m: Money): boolean {
  const a = parseFloat(m.amount);
  return !Number.isFinite(a) || a <= 0;
}

/** Como formatMoney, pero muestra "A confirmar" cuando el precio no está cargado. */
export function formatMoneyOrTBD(m: Money): string {
  return isPriceTBD(m) ? "A confirmar" : formatMoney(m);
}
