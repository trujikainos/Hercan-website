import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, CreditCard, ExternalLink, MapPin, Package, Truck } from "lucide-react";
import { getOrderDetail, type OrderDetail } from "@/lib/customer-account";
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
const isZero = (m: { amount: string } | null) => Boolean(m && Number(m.amount) === 0);
const fmtDate = (iso: string | null) => {
  if (!iso) return "";
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

const TXN_TYPE: Record<string, string> = {
  SALE: "Pago",
  CAPTURE: "Pago",
  AUTHORIZATION: "Autorización",
  REFUND: "Reembolso",
  VOID: "Anulación",
  CHANGE: "Ajuste",
};

type Tone = "green" | "blue" | "amber" | "gray";
const TONE: Record<Tone, { card: string; icon: string }> = {
  green: { card: "border-[#2e7d46]/25 bg-[#e6f4ea]", icon: "text-[#2e7d46]" },
  blue: { card: "border-hc-steel/25 bg-hc-soft", icon: "text-hc-steel" },
  amber: { card: "border-amber-300 bg-amber-50", icon: "text-amber-700" },
  gray: { card: "border-hc-metal-light bg-hc-soft", icon: "text-hc-gunmetal" },
};

// Estado global del pedido con descripción, tomando lo más específico (envío > preparación > pago).
function progress(o: OrderDetail): { label: string; desc: string; tone: Tone; done: boolean } {
  switch (o.shipmentStatus) {
    case "DELIVERED":
      return { label: "Entregado", desc: "Tu pedido fue entregado.", tone: "green", done: true };
    case "OUT_FOR_DELIVERY":
      return { label: "En reparto", desc: "Tu pedido está en reparto y llegará pronto.", tone: "blue", done: false };
    case "IN_TRANSIT":
      return { label: "En tránsito", desc: "Tu pedido va en camino.", tone: "blue", done: false };
    case "ATTEMPTED_DELIVERY":
      return { label: "Intento de entrega", desc: "Se intentó entregar tu pedido.", tone: "amber", done: false };
    case "READY_FOR_PICKUP":
    case "PICKED_UP":
      return { label: "Listo para recoger", desc: "Tu pedido está listo para recoger.", tone: "blue", done: false };
    case "FAILURE":
      return { label: "Problema con el envío", desc: "Hubo un problema con el envío. Contáctanos.", tone: "amber", done: false };
  }
  switch (o.fulfillmentStatus) {
    case "SUCCESS":
    case "FULFILLED":
      return { label: "Enviado", desc: "Preparamos y enviamos tus artículos.", tone: "blue", done: false };
    case "PARTIALLY_FULFILLED":
      return { label: "Enviado parcialmente", desc: "Parte de tu pedido ya fue enviado.", tone: "blue", done: false };
    case "IN_PROGRESS":
    case "OPEN":
      return { label: "En preparación", desc: "Estamos preparando estos artículos para el envío.", tone: "blue", done: false };
    case "ON_HOLD":
    case "SCHEDULED":
      return { label: "En espera", desc: "Tu pedido está en espera.", tone: "amber", done: false };
    case "CANCELLED":
      return { label: "Cancelado", desc: "Este pedido fue cancelado.", tone: "gray", done: false };
  }
  if (o.financialStatus === "PAID")
    return { label: "Confirmado", desc: "Estamos preparando estos artículos para el envío.", tone: "blue", done: false };
  return { label: "Pendiente", desc: "Estamos procesando tu pedido.", tone: "gray", done: false };
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // El GID viaja URL-encoded en la ruta (contiene "://" y "/"); hay que decodificarlo
  // antes de pasarlo al Customer Account API (si no, "Invalid global id").
  const order = await getOrderDetail(decodeURIComponent(id));

  if (!order) redirect("/cuenta");

  if ("error" in order) {
    return (
      <main id="contenido" className="mx-auto max-w-3xl flex-1 px-4 py-12">
        <Link href="/cuenta/pedidos" className="inline-flex items-center gap-1 text-sm text-hc-blue">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Volver a mis pedidos
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
  const prog = progress(order);
  const tone = TONE[prog.tone];
  const StatusIcon = prog.done ? CheckCircle2 : Truck;
  const paid = order.totalPaid && !isZero(order.totalPaid) ? order.totalPaid : order.total;

  return (
    <main id="contenido" className="mx-auto max-w-4xl flex-1 px-4 py-8">
      <Link href="/cuenta/pedidos" className="inline-flex items-center gap-1 text-sm text-hc-blue hover:text-hc-steel">
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
          <p className="mt-0.5 text-sm text-hc-gunmetal">Fecha de confirmación: {fmtDate(order.processedAt)}</p>
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

      {/* Banner de estado del pedido */}
      <div className={`mt-5 flex items-start gap-3 rounded-xl border p-4 ${tone.card}`}>
        <StatusIcon className={`mt-0.5 h-6 w-6 shrink-0 ${tone.icon}`} aria-hidden />
        <div className="min-w-0">
          <p className="font-heading text-hc-navy">{prog.label}</p>
          <p className="text-sm text-hc-gunmetal">{prog.desc}</p>
          {(order.statusDate || order.estimatedDeliveryAt) && (
            <p className="mt-1 text-xs text-hc-gunmetal">
              {order.statusDate && <>Actualizado: {fmtDate(order.statusDate)}</>}
              {order.estimatedDeliveryAt && (
                <span className={order.statusDate ? "ml-2" : ""}>
                  Entrega estimada: {fmtDate(order.estimatedDeliveryAt)}
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Productos */}
        <section className="rounded-xl border border-hc-metal-light bg-white p-4">
          <h2 className="mb-1 flex items-center gap-2 px-1 font-heading text-sm font-semibold uppercase tracking-wide text-hc-gunmetal">
            <Package className="h-4 w-4" aria-hidden /> Artículos ({order.itemCount})
          </h2>
          <ul className="divide-y divide-hc-metal-light">
            {order.items.map((it, i) => {
              const thumb = (
                <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-hc-metal-light">
                  <ProductImage src={it.image} alt={it.title} imgClassName="h-full w-full object-contain" iconClassName="h-6 w-auto" />
                </span>
              );
              return (
                <li key={i} className="flex items-center gap-3 py-3">
                  {it.handle ? (
                    <Link href={`/producto/${it.handle}`} className="group flex min-w-0 flex-1 items-center gap-3">
                      {thumb}
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm text-hc-ink group-hover:text-hc-blue">{it.title}</span>
                        <span className="text-xs text-hc-gunmetal">Cantidad: {it.quantity}</span>
                      </span>
                    </Link>
                  ) : (
                    <>
                      {thumb}
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm text-hc-ink">{it.title}</span>
                        <span className="text-xs text-hc-gunmetal">Cantidad: {it.quantity}</span>
                      </span>
                    </>
                  )}
                  <span className="shrink-0 font-heading text-sm text-hc-navy">{money(it.lineTotal)}</span>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Resumen + pago + envío */}
        <aside className="space-y-6">
          {/* Desglose */}
          <div className="rounded-xl border border-hc-metal-light bg-white p-5">
            <h2 className="mb-3 font-heading text-sm font-semibold uppercase tracking-wide text-hc-gunmetal">Resumen</h2>
            <dl className="space-y-1.5 text-sm">
              {order.subtotal && (
                <div className="flex justify-between">
                  <dt className="text-hc-gunmetal">Subtotal · {order.itemCount} art.</dt>
                  <dd className="text-hc-ink">{money(order.subtotal)}</dd>
                </div>
              )}
              {order.shipping && (
                <div className="flex justify-between">
                  <dt className="text-hc-gunmetal">Envío</dt>
                  <dd className={isZero(order.shipping) ? "font-medium text-[#2e7d46]" : "text-hc-ink"}>
                    {isZero(order.shipping) ? "Gratis" : money(order.shipping)}
                  </dd>
                </div>
              )}
              <div className="mt-1 flex items-baseline justify-between border-t border-hc-metal-light pt-2">
                <dt className="font-heading text-hc-navy">Total</dt>
                <dd className="text-right">
                  <span className="font-heading text-lg text-hc-navy">{money(order.total)}</span>
                  {order.total && <span className="ml-1 text-[11px] text-hc-gunmetal">{order.total.currencyCode}</span>}
                </dd>
              </div>
              {order.tax && !isZero(order.tax) && (
                <p className="text-right text-[11px] text-hc-gunmetal">Incluye {money(order.tax)} de impuestos</p>
              )}
            </dl>
          </div>

          {/* Pago */}
          {(order.transactions.length > 0 || paid) && (
            <div className="rounded-xl border border-hc-metal-light bg-white p-5">
              <h2 className="mb-2 flex items-center gap-2 font-heading text-sm font-semibold uppercase tracking-wide text-hc-gunmetal">
                <CreditCard className="h-4 w-4" aria-hidden /> Pago
              </h2>
              <div className="mb-2">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${fin.cls}`}>
                  {fin.label}
                </span>
              </div>
              {order.transactions.length > 0 ? (
                <ul className="space-y-2 text-sm">
                  {order.transactions.map((t, j) => (
                    <li key={j} className="flex items-baseline justify-between gap-2">
                      <span className="text-hc-gunmetal">
                        {t.type ? TXN_TYPE[t.type] ?? "Pago" : "Pago"}
                        {t.card && (
                          <span className="text-hc-ink">
                            {" · "}
                            {t.card.brand}
                            {t.card.last4 ? ` ····${t.card.last4}` : ""}
                          </span>
                        )}
                        {t.processedAt && <span className="block text-[11px] text-hc-metal">{fmtDate(t.processedAt)}</span>}
                      </span>
                      <span className="shrink-0 text-hc-ink">{money(t.amount)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-hc-ink">Pagado {money(paid)}</p>
              )}
            </div>
          )}

          {/* Envío a + método */}
          {((order.shippingAddress && order.shippingAddress.length > 0) || order.shippingMethod) && (
            <div className="rounded-xl border border-hc-metal-light bg-white p-5">
              <h2 className="mb-2 flex items-center gap-2 font-heading text-sm font-semibold uppercase tracking-wide text-hc-gunmetal">
                <MapPin className="h-4 w-4" aria-hidden /> Envío
              </h2>
              {order.shippingMethod && (
                <p className="mb-2 text-sm">
                  <span className="text-hc-gunmetal">Método: </span>
                  <span className="text-hc-ink">{order.shippingMethod}</span>
                </p>
              )}
              {order.shippingAddress && order.shippingAddress.length > 0 && (
                <address className="text-sm not-italic leading-relaxed text-hc-ink">
                  {order.shippingAddress.map((l, j) => (
                    <span key={j} className="block">
                      {l}
                    </span>
                  ))}
                </address>
              )}
            </div>
          )}

          {/* Rastreo (guía) */}
          {order.tracking.length > 0 && (
            <div className="rounded-xl border border-hc-metal-light bg-white p-5">
              <h2 className="mb-2 flex items-center gap-2 font-heading text-sm font-semibold uppercase tracking-wide text-hc-gunmetal">
                <Truck className="h-4 w-4" aria-hidden /> Rastreo
              </h2>
              <ul className="space-y-2 text-sm">
                {order.tracking.map((t, j) => (
                  <li key={j} className="flex items-baseline gap-1.5">
                    {t.company && <span className="text-hc-gunmetal">{t.company}:</span>}
                    {t.url ? (
                      <a href={t.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-hc-blue hover:text-hc-steel">
                        {t.number || "Rastrear envío"}
                        <ExternalLink className="h-3 w-3" aria-hidden />
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
