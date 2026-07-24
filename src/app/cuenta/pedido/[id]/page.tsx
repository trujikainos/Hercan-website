import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ExternalLink, MapPin, Truck } from "lucide-react";
import { getOrderDetail } from "@/lib/customer-account";
import { ProductImage } from "@/components/product-image";
import { ReorderButton } from "@/components/reorder-button";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { absolute: "Detalle de pedido | HERCAN" },
  robots: { index: false, follow: false },
};

const money = (m: { amount: string; currencyCode: string } | null) => {
  if (!m) return "—";
  const n = Number(m.amount);
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: m.currencyCode || "MXN" }).format(n);
};
const fmtDate = (iso: string) => {
  try {
    return new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(iso));
  } catch {
    return iso;
  }
};
const FIN: Record<string, { label: string; cls: string }> = {
  PAID: { label: "Pagado", cls: "bg-[#e6f4ea] text-[#2e7d46]" },
  PENDING: { label: "Pendiente", cls: "bg-[#fff4e5] text-[#b25e00]" },
  PARTIALLY_PAID: { label: "Pago parcial", cls: "bg-[#fff4e5] text-[#b25e00]" },
  AUTHORIZED: { label: "Autorizado", cls: "bg-hc-soft text-hc-steel" },
  REFUNDED: { label: "Reembolsado", cls: "bg-hc-soft text-hc-gunmetal" },
  PARTIALLY_REFUNDED: { label: "Reembolso parcial", cls: "bg-hc-soft text-hc-gunmetal" },
  VOIDED: { label: "Anulado", cls: "bg-hc-soft text-hc-gunmetal" },
  EXPIRED: { label: "Expirado", cls: "bg-hc-soft text-hc-gunmetal" },
};

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // El GID viaja URL-encoded en la ruta (contiene "://" y "/"); hay que decodificarlo
  // antes de pasarlo al Customer Account API (si no, "Invalid global id").
  const order = await getOrderDetail(decodeURIComponent(id));

  if (!order) redirect("/cuenta");

  if ("error" in order) {
    return (
      <main id="contenido" className="mx-auto max-w-3xl flex-1 px-4 py-12">
        <Link href="/cuenta" className="inline-flex items-center gap-1 text-sm text-hc-blue">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Volver a mi cuenta
        </Link>
        <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">No se pudo cargar el pedido (diagnóstico temporal):</p>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-xs">{order.error}</pre>
        </div>
      </main>
    );
  }

  const fin = (order.financialStatus && FIN[order.financialStatus]) || {
    label: order.financialStatus ?? "—",
    cls: "bg-hc-soft text-hc-gunmetal",
  };

  return (
    <main id="contenido" className="mx-auto max-w-4xl flex-1 px-4 py-8">
      <Link href="/cuenta" className="inline-flex items-center gap-1 text-sm text-hc-blue hover:text-hc-steel">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Volver a mis pedidos
      </Link>

      {/* Encabezado */}
      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl text-hc-navy">Pedido {order.name}</h1>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${fin.cls}`}>
              {fin.label}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-hc-gunmetal">{fmtDate(order.processedAt)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ReorderButton items={order.items} />
          {order.statusUrl && (
            <a
              href={order.statusUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="press inline-flex items-center gap-1.5 rounded-lg border border-hc-metal-light bg-white px-3.5 py-2 text-sm font-medium text-hc-navy transition-colors hover:border-hc-steel hover:text-hc-blue"
            >
              Rastreo en Shopify
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Productos */}
        <section className="rounded-xl border border-hc-metal-light bg-white p-4">
          <ul className="divide-y divide-hc-metal-light">
            {order.items.map((it, i) => (
              <li key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-hc-metal-light">
                  <ProductImage src={it.image} alt={it.title} imgClassName="h-full w-full object-contain" iconClassName="h-6 w-auto" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm text-hc-ink">{it.title}</span>
                  <span className="text-xs text-hc-gunmetal">Cantidad: {it.quantity}</span>
                </span>
                <span className="shrink-0 font-heading text-sm text-hc-navy">{money(it.lineTotal)}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Resumen + envío */}
        <aside className="space-y-6">
          <div className="rounded-xl border border-hc-metal-light bg-white p-5">
            <h2 className="mb-3 font-heading text-sm font-semibold uppercase tracking-wide text-hc-gunmetal">
              Resumen
            </h2>
            <dl className="space-y-1.5 text-sm">
              {order.subtotal && (
                <div className="flex justify-between">
                  <dt className="text-hc-gunmetal">Subtotal</dt>
                  <dd className="text-hc-ink">{money(order.subtotal)}</dd>
                </div>
              )}
              {order.shipping && (
                <div className="flex justify-between">
                  <dt className="text-hc-gunmetal">Envío</dt>
                  <dd className="text-hc-ink">{money(order.shipping)}</dd>
                </div>
              )}
              {order.tax && (
                <div className="flex justify-between">
                  <dt className="text-hc-gunmetal">Impuestos</dt>
                  <dd className="text-hc-ink">{money(order.tax)}</dd>
                </div>
              )}
              <div className="mt-1 flex justify-between border-t border-hc-metal-light pt-2">
                <dt className="font-heading text-hc-navy">Total</dt>
                <dd className="font-heading text-lg text-hc-navy">{money(order.total)}</dd>
              </div>
            </dl>
          </div>

          {order.shippingAddress && order.shippingAddress.length > 0 && (
            <div className="rounded-xl border border-hc-metal-light bg-white p-5">
              <h2 className="mb-2 flex items-center gap-2 font-heading text-sm font-semibold uppercase tracking-wide text-hc-gunmetal">
                <MapPin className="h-4 w-4" aria-hidden /> Envío a
              </h2>
              <address className="text-sm not-italic leading-relaxed text-hc-ink">
                {order.shippingAddress.map((l, j) => (
                  <span key={j} className="block">
                    {l}
                  </span>
                ))}
              </address>
            </div>
          )}

          {order.tracking.length > 0 && (
            <div className="rounded-xl border border-hc-metal-light bg-white p-5">
              <h2 className="mb-2 flex items-center gap-2 font-heading text-sm font-semibold uppercase tracking-wide text-hc-gunmetal">
                <Truck className="h-4 w-4" aria-hidden /> Rastreo
              </h2>
              <ul className="space-y-2 text-sm">
                {order.tracking.map((t, j) => (
                  <li key={j}>
                    {t.company && <span className="text-hc-gunmetal">{t.company}: </span>}
                    {t.url ? (
                      <a href={t.url} target="_blank" rel="noopener noreferrer" className="text-hc-blue hover:text-hc-steel">
                        {t.number || "Rastrear envío"}
                      </a>
                    ) : (
                      <span className="text-hc-ink">{t.number}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
