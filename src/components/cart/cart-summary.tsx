"use client";
import { useState } from "react";
import Link from "next/link";
import { Loader2, ShoppingCart } from "lucide-react";
import { formatMoneyOrTBD } from "../ui";
import { useCart } from "./cart-provider";
import { getCheckoutUrlAction } from "@/app/cart/actions";

export function CartSummary() {
  const { cart, isPending } = useCart();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const empty = !cart || cart.totalQuantity === 0;

  async function checkout() {
    setErr(null);
    setLoading(true);
    try {
      const { url, result } = await getCheckoutUrlAction();
      if (url) window.location.assign(url);
      else setErr(result.notices[0]?.message ?? "No se pudo continuar al pago.");
    } catch {
      setErr("No se pudo continuar al pago. Reintenta.");
    } finally {
      setLoading(false);
    }
  }

  if (empty) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <ShoppingCart className="h-10 w-10 text-hc-metal" aria-hidden />
        <p className="text-hc-gunmetal">Tu carrito está vacío.</p>
        <Link
          href="/productos"
          className="rounded-lg bg-hc-blue px-4 py-2 text-sm font-medium text-white hover:bg-hc-steel"
        >
          Ver catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-hc-gunmetal">Subtotal (sin IVA)</span>
        <span className="font-heading text-lg text-hc-navy">{formatMoneyOrTBD(cart.subtotal)}</span>
      </div>
      <p className="text-xs text-hc-gunmetal">El IVA (16%) se calcula en el checkout.</p>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <button
        onClick={checkout}
        disabled={loading || isPending}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-hc-blue px-5 py-3 font-medium text-white transition hover:bg-hc-steel disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
        {loading ? "Redirigiendo…" : "Proceder al pago"}
      </button>
    </div>
  );
}
