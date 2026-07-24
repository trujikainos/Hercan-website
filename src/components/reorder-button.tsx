"use client";

import { RotateCcw } from "lucide-react";
import { useCart } from "./cart/cart-provider";

/**
 * "Volver a pedir": relanza al carrito todos los productos (con variante válida) de un
 * pedido y abre el carrito. Oro para B2B que recompra lo mismo. Se oculta si el carrito
 * no está habilitado o ningún renglón tiene variante disponible.
 */
type ReorderItem = {
  variantId: string | null;
  quantity: number;
  title: string;
  image: string | null;
};

export function ReorderButton({
  items,
  currency = "MXN",
  small = false,
}: {
  items: ReorderItem[];
  currency?: string;
  small?: boolean;
}) {
  const { add, openCart, enabled } = useCart();
  const valid = items.filter((i): i is ReorderItem & { variantId: string } =>
    Boolean(i.variantId),
  );
  if (!enabled || valid.length === 0) return null;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        for (const i of valid)
          add({
            variantId: i.variantId,
            quantity: i.quantity || 1,
            // El precio real lo trae el servidor al confirmar; el optimista solo llena
            // la línea del carrito un instante (título + imagen del pedido).
            optimistic: {
              productTitle: i.title,
              handle: "",
              image: i.image,
              unitPrice: { amount: "0", currencyCode: currency },
            },
          });
        openCart();
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
