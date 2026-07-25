import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CustomerOrder } from "@/lib/customer-account";
import { ProductImage } from "@/components/product-image";
import { ReorderButton } from "@/components/reorder-button";
import { money, fmtDate, finStatus } from "./format";

export function StatusBadge({ status }: { status: string | null }) {
  const s = finStatus(status);
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${s.cls}`}>
      {s.label}
    </span>
  );
}

export function OrderCard({ order }: { order: CustomerOrder }) {
  const items = order.lineItems;
  const thumbs = items.slice(0, 5);
  const extra = items.length - thumbs.length;
  const detailHref = `/cuenta/pedido/${encodeURIComponent(order.id)}`;
  return (
    <div className="rounded-xl border border-hc-metal-light bg-white p-4 transition hover:border-hc-steel">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Link href={detailHref} className="font-heading text-base text-hc-navy hover:text-hc-blue">
            {order.name}
          </Link>
          <StatusBadge status={order.financialStatus} />
        </div>
        <span className="font-heading text-lg text-hc-navy">{money(order.total)}</span>
      </div>
      <p className="mt-0.5 text-xs text-hc-gunmetal">{fmtDate(order.processedAt)}</p>

      {thumbs.length > 0 && (
        <Link href={detailHref} className="mt-3 flex items-center gap-2" aria-label={`Ver pedido ${order.name}`}>
          {thumbs.map((li, i) => (
            <span
              key={i}
              className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md border border-hc-metal-light"
              title={`${li.title} ×${li.quantity}`}
            >
              <ProductImage src={li.image} alt={li.title} imgClassName="h-full w-full object-contain" iconClassName="h-5 w-auto" />
            </span>
          ))}
          {extra > 0 && <span className="text-xs text-hc-gunmetal">+{extra}</span>}
        </Link>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Link
          href={detailHref}
          className="inline-flex items-center gap-1 text-sm font-medium text-hc-blue hover:text-hc-steel"
        >
          Ver detalle
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
        <ReorderButton items={items} small />
      </div>
    </div>
  );
}
