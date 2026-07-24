"use client";

import { RotateCcw } from "lucide-react";
import { useCart } from "./cart/cart-provider";

/**
 * "Volver a pedir": relanza al carrito los productos DISPONIBLES de un pedido y abre el
 * carrito. El servidor verifica stock y avisa si algún producto está agotado (no lo
 * agrega). Oro para B2B que recompra lo mismo. Se oculta si el carrito no está habilitado
 * o ningún renglón tiene variante.
 */
export function ReorderButton({
  items,
  small = false,
}: {
  items: { variantId: string | null; quantity: number }[];
  small?: boolean;
}) {
  const { reorder, enabled } = useCart();
  const valid = items.filter(
    (i): i is { variantId: string; quantity: number } => Boolean(i.variantId),
  );
  if (!enabled || valid.length === 0) return null;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        reorder(valid.map((i) => ({ variantId: i.variantId, quantity: i.quantity })));
      }}
      className={`press inline-flex items-center gap-1.5 rounded-lg border border-hc-metal-light bg-white font-medium text-hc-navy transition-colors hover:border-hc-steel hover:text-hc-blue ${
        small ? "px-2.5 py-1 text-xs" : "px-3.5 py-2 text-sm"
      }`}
    >
      <RotateCcw className={small ? "h-3.5 w-3.5" : "h-4 w-4"} aria-hidden />
      Volver a pedir
    </button>
  );
}
