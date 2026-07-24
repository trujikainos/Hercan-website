"use client";
import { ShoppingCart } from "lucide-react";
import { useCart } from "./cart-provider";

export function CartButton() {
  const { enabled, count, openCart } = useCart();
  const showBadge = enabled && count > 0;
  return (
    <a
      href="/carrito"
      onClick={(e) => {
        if (enabled) {
          e.preventDefault();
          openCart();
        }
      }}
      aria-label={showBadge ? `Carrito (${count})` : "Carrito"}
      className="group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-hc-soft"
    >
      <ShoppingCart className="h-[22px] w-[22px] text-hc-navy transition-transform duration-200 group-hover:scale-105" />
      {showBadge && (
        <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-hc-blue px-1 text-[11px] font-semibold text-white ring-2 ring-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </a>
  );
}
