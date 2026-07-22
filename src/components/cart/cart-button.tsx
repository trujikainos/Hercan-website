"use client";
import { ShoppingCart } from "lucide-react";
import { useCart } from "./cart-provider";

export function CartButton() {
  const { enabled, count, openCart } = useCart();
  return (
    <a
      href="/carrito"
      onClick={(e) => {
        if (enabled) {
          e.preventDefault();
          openCart();
        }
      }}
      aria-label="Carrito"
      className="relative"
    >
      <ShoppingCart className="h-6 w-6 text-hc-navy" />
      {enabled && count > 0 && (
        <span className="absolute -right-2 -top-2 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-hc-blue px-1 text-[11px] font-medium text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </a>
  );
}
