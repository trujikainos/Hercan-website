"use client";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "./cart-provider";
import { CartLineItem } from "./cart-line-item";
import { CartSummary } from "./cart-summary";

export function CartPageContents() {
  const { cart, enabled, notices } = useCart();

  if (!enabled) {
    return (
      <div className="py-16 text-center text-hc-gunmetal">
        El carrito y el checkout de Shopify se conectan en la Fase 3.
      </div>
    );
  }

  const empty = !cart || cart.lines.length === 0;
  if (empty) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <ShoppingCart className="h-12 w-12 text-hc-metal" aria-hidden />
        <p className="text-hc-gunmetal">Tu carrito está vacío.</p>
        <Link
          href="/productos"
          className="rounded-lg bg-hc-blue px-5 py-2.5 font-medium text-white hover:bg-hc-steel"
        >
          Ver catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_320px]">
      <div>
        {notices.length > 0 && (
          <div className="mb-4 rounded-lg bg-[#fff8ec] px-4 py-2 text-sm text-[#b25e00]">
            {notices.map((n, i) => (
              <p key={i}>{n.message}</p>
            ))}
          </div>
        )}
        <div className="divide-y divide-hc-metal-light">
          {cart!.lines.map((l) => (
            <CartLineItem key={l.id} line={l} />
          ))}
        </div>
      </div>
      <div className="h-fit rounded-xl border border-hc-metal-light p-4">
        <CartSummary />
      </div>
    </div>
  );
}
