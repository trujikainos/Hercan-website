"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, Package } from "lucide-react";
import type { CustomerOrder } from "@/lib/customer-account";
import { ORDER_RANGES, type OrderRange } from "@/lib/order-filters";
import { loadOrdersAction } from "@/app/cuenta/actions";
import { OrderCard } from "./order-card";

export function OrdersSection({
  initialOrders,
  initialHasNext,
  initialCursor,
}: {
  initialOrders: CustomerOrder[];
  initialHasNext: boolean;
  initialCursor: string | null;
}) {
  const [range, setRange] = useState<OrderRange>("todo");
  const [orders, setOrders] = useState<CustomerOrder[]>(initialOrders);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [hasNext, setHasNext] = useState(initialHasNext);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function changeRange(next: OrderRange) {
    if (next === range) return;
    setRange(next);
    setError(null);
    start(async () => {
      const r = await loadOrdersAction({ range: next, after: null });
      if (r.ok) {
        setOrders(r.orders);
        setCursor(r.endCursor);
        setHasNext(r.hasNextPage);
      } else {
        setError(r.error);
      }
    });
  }

  function loadMore() {
    setError(null);
    start(async () => {
      const r = await loadOrdersAction({ range, after: cursor });
      if (r.ok) {
        setOrders((prev) => [...prev, ...r.orders]);
        setCursor(r.endCursor);
        setHasNext(r.hasNextPage);
      } else {
        setError(r.error);
      }
    });
  }

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-heading text-xl text-hc-navy">
          <Package className="h-5 w-5 text-hc-steel" aria-hidden />
          Mis pedidos
        </h2>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-hc-gunmetal">Periodo:</span>
          <select
            value={range}
            onChange={(e) => changeRange(e.target.value as OrderRange)}
            disabled={pending}
            className="rounded-lg border border-hc-metal-light bg-white px-3 py-1.5 text-sm outline-none focus:border-hc-steel disabled:opacity-60"
          >
            {ORDER_RANGES.map((r) => (
              <option key={r.key} value={r.key}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-hc-metal-light bg-white p-8 text-center">
          <p className="text-sm text-hc-gunmetal">
            {range === "todo" ? "Aún no tienes pedidos." : "No hay pedidos en este periodo."}
          </p>
          <Link
            href="/productos"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-hc-blue hover:text-hc-steel"
          >
            Explorar el catálogo
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      ) : (
        <div className={`space-y-3 ${pending ? "opacity-60" : ""}`}>
          {orders.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </div>
      )}

      {hasNext && orders.length > 0 && (
        <div className="mt-5 flex justify-center">
          <button
            onClick={loadMore}
            disabled={pending}
            className="press inline-flex items-center gap-2 rounded-lg border border-hc-metal-light bg-white px-5 py-2.5 text-sm font-medium text-hc-navy transition-colors hover:border-hc-steel hover:text-hc-blue disabled:opacity-60"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            Cargar más
          </button>
        </div>
      )}
    </section>
  );
}
