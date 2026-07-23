"use client";
import { useState, useRef, useEffect } from "react";
import { ShoppingCart, Loader2, Check, Minus, Plus } from "lucide-react";
import { useCart } from "./cart-provider";

export function AddToCartButton({
  variantId,
  variantAvailable,
  stock,
  productTitle,
  handle,
  image,
  unitPrice,
  currency,
}: {
  variantId: string | null;
  variantAvailable: boolean;
  stock?: number | null;
  productTitle: string;
  handle: string;
  image: string | null;
  unitPrice: number | null;
  currency: string;
}) {
  const { add, enabled, isPending } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const [qty, setQty] = useState(1);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (addedTimer.current) clearTimeout(addedTimer.current); }, []);

  // Solo se puede vender lo que hay en existencia: tope = stock disponible (máx 99).
  const maxQty = stock != null && stock > 0 ? Math.min(stock, 99) : 99;
  const canAdd = enabled && !!variantId && variantAvailable && (stock == null || stock > 0);

  if (!canAdd) {
    return (
      <button
        disabled
        title={!enabled ? "El carrito estará disponible pronto" : "No disponible en línea"}
        className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg border border-hc-metal-light px-5 py-2.5 font-medium text-hc-gunmetal"
      >
        <ShoppingCart className="h-4 w-4" aria-hidden />
        No disponible en línea
      </button>
    );
  }

  const clamp = (n: number) => Math.min(maxQty, Math.max(1, n));

  function onClick() {
    if (!variantId) return;
    add({
      variantId,
      quantity: qty,
      optimistic: {
        productTitle,
        handle,
        image,
        unitPrice: { amount: String(unitPrice ?? 0), currencyCode: currency },
      },
    });
    setJustAdded(true);
    if (addedTimer.current) clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setJustAdded(false), 1800);
    setQty(1);
  }

  const atStockMax = stock != null && stock > 0 && stock <= 99 && qty >= stock;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-3">
      <div className="flex items-center rounded-lg border border-hc-metal-light">
        <button
          type="button"
          onClick={() => setQty((q) => clamp(q - 1))}
          disabled={qty <= 1}
          aria-label="Disminuir cantidad"
          className="px-2.5 py-2 text-hc-gunmetal transition hover:text-hc-blue disabled:opacity-40"
        >
          <Minus className="h-4 w-4" />
        </button>
        <input
          type="number"
          inputMode="numeric"
          min={1}
          max={maxQty}
          step={1}
          value={qty}
          onKeyDown={(e) => {
            // Solo enteros: bloquea . , e E - + (los decimales no aplican a piezas).
            if ([".", ",", "e", "E", "-", "+"].includes(e.key)) e.preventDefault();
          }}
          onChange={(e) => {
            const v = parseInt(e.target.value.replace(/[^\d]/g, ""), 10);
            setQty(Number.isFinite(v) ? clamp(v) : 1);
          }}
          aria-label="Cantidad"
          className="w-12 border-x border-hc-metal-light bg-transparent py-2 text-center text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          type="button"
          onClick={() => setQty((q) => clamp(q + 1))}
          disabled={qty >= maxQty}
          aria-label="Aumentar cantidad"
          className="px-2.5 py-2 text-hc-gunmetal transition hover:text-hc-blue disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <button
        onClick={onClick}
        disabled={isPending}
        className="press inline-flex items-center gap-2 rounded-lg bg-hc-blue px-5 py-2.5 font-medium text-white transition-colors hover:bg-hc-steel disabled:opacity-70"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : justAdded ? (
          <Check className="h-4 w-4" aria-hidden />
        ) : (
          <ShoppingCart className="h-4 w-4" aria-hidden />
        )}
        {justAdded ? "Agregado" : "Agregar al carrito"}
      </button>
      </div>
      {atStockMax && (
        <p className="text-xs text-[#b25e00]">Máximo disponible: {stock}</p>
      )}
    </div>
  );
}
