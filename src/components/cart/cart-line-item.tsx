"use client";
import Link from "next/link";
import { ImageIcon, Minus, Plus, Trash2 } from "lucide-react";
import type { CartLine } from "@/lib/cart-types";
import { formatMoney, formatMoneyOrTBD, isPriceTBD } from "../ui";
import { useCart } from "./cart-provider";

export function CartLineItem({ line }: { line: CartLine }) {
  const { updateQty, remove, notify, isPending } = useCart();
  const max = line.quantityAvailable;
  const atMax = max != null && line.quantity >= max;
  const onIncrease = () => {
    if (atMax) {
      notify(`Solo hay ${max} disponibles de "${line.productTitle}".`);
      return;
    }
    updateQty(line.id, line.quantity + 1);
  };
  return (
    <div className={`flex gap-3 py-3 ${isPending ? "opacity-60" : ""}`}>
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-hc-metal-light bg-hc-soft text-hc-metal">
        {line.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={line.image} alt={line.productTitle} className="h-full w-full object-contain" />
        ) : (
          <ImageIcon className="h-6 w-6" aria-hidden />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <Link
          href={`/producto/${line.handle}`}
          className="line-clamp-2 text-sm font-medium text-hc-ink hover:text-hc-blue"
        >
          {line.productTitle}
        </Link>
        <p className="mt-0.5 text-xs text-hc-gunmetal">
          {isPriceTBD(line.unitPrice) ? "Precio a confirmar" : `${formatMoney(line.unitPrice)} c/u`}
        </p>
        {!line.availableForSale ? (
          <p className="mt-0.5 text-xs text-[#b25e00]">Sin stock</p>
        ) : atMax && max != null ? (
          <p className="mt-0.5 text-xs text-[#b25e00]">Máximo disponible: {max}</p>
        ) : null}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center rounded-lg border border-hc-metal-light">
            <button
              onClick={() => updateQty(line.id, line.quantity - 1)}
              disabled={isPending || line.quantity <= 1}
              aria-label="Disminuir"
              className="px-2 py-1 text-hc-gunmetal hover:text-hc-blue disabled:opacity-50"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-[2ch] text-center text-sm">{line.quantity}</span>
            <button
              onClick={onIncrease}
              disabled={isPending}
              aria-label="Aumentar"
              title={atMax ? `Máximo ${max} disponibles` : undefined}
              className={`px-2 py-1 transition disabled:opacity-50 ${
                atMax ? "text-hc-metal" : "text-hc-gunmetal hover:text-hc-blue"
              }`}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-heading text-sm text-hc-navy">{formatMoneyOrTBD(line.lineTotal)}</span>
            <button
              onClick={() => remove(line.id)}
              disabled={isPending}
              aria-label="Quitar"
              className="text-hc-gunmetal hover:text-red-600 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
