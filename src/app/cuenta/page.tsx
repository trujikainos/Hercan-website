import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, LogOut, MapPin, Package, User } from "lucide-react";
import { getCustomerAccount, type CustomerOrder } from "@/lib/customer-account";

// Página privada de cuenta: SIEMPRE dinámica (lee la sesión), NUNCA indexable.
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { absolute: "Mi cuenta | HERCAN" },
  robots: { index: false, follow: false },
};

const money = (m: { amount: string; currencyCode: string } | null) => {
  if (!m) return "—";
  const n = Number(m.amount);
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: m.currencyCode || "MXN",
  }).format(n);
};

const fmtDate = (iso: string) => {
  try {
    return new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
};

// Estado financiero → etiqueta + color.
const FIN_STATUS: Record<string, { label: string; cls: string }> = {
  PAID: { label: "Pagado", cls: "bg-[#e6f4ea] text-[#2e7d46]" },
  PENDING: { label: "Pendiente", cls: "bg-[#fff4e5] text-[#b25e00]" },
  PARTIALLY_PAID: { label: "Pago parcial", cls: "bg-[#fff4e5] text-[#b25e00]" },
  AUTHORIZED: { label: "Autorizado", cls: "bg-hc-soft text-hc-steel" },
  REFUNDED: { label: "Reembolsado", cls: "bg-hc-soft text-hc-gunmetal" },
  PARTIALLY_REFUNDED: { label: "Reembolso parcial", cls: "bg-hc-soft text-hc-gunmetal" },
  VOIDED: { label: "Anulado", cls: "bg-hc-soft text-hc-gunmetal" },
  EXPIRED: { label: "Expirado", cls: "bg-hc-soft text-hc-gunmetal" },
};

function StatusBadge({ status }: { status: string | null }) {
  const s = (status && FIN_STATUS[status]) || { label: status ?? "—", cls: "bg-hc-soft text-hc-gunmetal" };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${s.cls}`}>
      {s.label}
    </span>
  );
}

function OrderCard({ order }: { order: CustomerOrder }) {
  const items = order.lineItems;
  const shownItems = items.slice(0, 3);
  const extra = items.length - shownItems.length;
  return (
    <div className="rounded-xl border border-hc-metal-light bg-white p-4 transition hover:border-hc-steel">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="font-heading text-base text-hc-navy">{order.name}</span>
          <StatusBadge status={order.financialStatus} />
        </div>
        <span className="font-heading text-lg text-hc-navy">{money(order.total)}</span>
      </div>
      <p className="mt-0.5 text-xs text-hc-gunmetal">{fmtDate(order.processedAt)}</p>
      {shownItems.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm text-hc-ink">
          {shownItems.map((li, i) => (
            <li key={i} className="flex items-center justify-between gap-3">
              <span className="min-w-0 truncate">{li.title}</span>
              <span className="shrink-0 text-hc-gunmetal">×{li.quantity}</span>
            </li>
          ))}
          {extra > 0 && <li className="text-xs text-hc-gunmetal">+{extra} más</li>}
        </ul>
      )}
      {order.statusUrl && (
        <a
          href={order.statusUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-hc-blue hover:text-hc-steel"
        >
          Ver detalle y rastreo
          <ArrowRight className="h-4 w-4" aria-hidden />
        </a>
      )}
    </div>
  );
}

export default async function CuentaPage() {
  const acc = await getCustomerAccount();

  // Sin sesión → arranca el login.
  if (!acc) redirect("/account/login");

  // Sesión válida pero la API no respondió (fallo transitorio): mensaje amigable.
  if ("error" in acc) {
    return (
      <main id="contenido" className="mx-auto max-w-3xl flex-1 px-4 py-16 text-center">
        <h1 className="font-heading text-2xl text-hc-navy">Mi cuenta</h1>
        <p className="mt-3 text-hc-gunmetal">
          No pudimos cargar tu información en este momento. Vuelve a intentarlo en unos
          segundos.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/cuenta"
            className="press rounded-lg bg-hc-steel px-4 py-2 text-sm font-medium text-white hover:bg-hc-blue"
          >
            Reintentar
          </Link>
          <a
            href="/account/logout"
            className="press inline-flex items-center gap-1 rounded-lg border border-hc-metal-light px-4 py-2 text-sm font-medium text-hc-navy hover:border-hc-steel"
          >
            <LogOut className="h-4 w-4" aria-hidden /> Cerrar sesión
          </a>
        </div>
      </main>
    );
  }

  const { profile, orders, addresses } = acc;

  return (
    <main id="contenido" className="flex-1">
      {/* Encabezado */}
      <section className="border-b border-hc-metal-light bg-hc-soft">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-8">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-hc-navy to-hc-steel font-heading text-lg font-semibold text-white">
              {(profile.name || profile.email).charAt(0).toUpperCase()}
            </span>
            <div>
              <h1 className="font-heading text-[length:var(--step-h2)] leading-tight text-hc-navy">
                {profile.name || "Mi cuenta"}
              </h1>
              <p className="text-sm text-hc-gunmetal">{profile.email}</p>
            </div>
          </div>
          <a
            href="/account/logout"
            className="press inline-flex items-center gap-2 rounded-lg border border-hc-metal-light bg-white px-3.5 py-2 text-sm font-medium text-hc-navy transition-colors hover:border-hc-steel hover:text-hc-blue"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Cerrar sesión
          </a>
        </div>
      </section>

      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 lg:grid-cols-[1fr_320px]">
        {/* Pedidos */}
        <section>
          <h2 className="mb-4 flex items-center gap-2 font-heading text-xl text-hc-navy">
            <Package className="h-5 w-5 text-hc-steel" aria-hidden />
            Mis pedidos
          </h2>
          {orders.length === 0 ? (
            <div className="rounded-xl border border-dashed border-hc-metal-light bg-white p-8 text-center">
              <p className="text-sm text-hc-gunmetal">Aún no tienes pedidos.</p>
              <Link
                href="/productos"
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-hc-blue hover:text-hc-steel"
              >
                Explorar el catálogo
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <OrderCard key={o.id} order={o} />
              ))}
            </div>
          )}
        </section>

        {/* Panel lateral: datos + direcciones */}
        <aside className="space-y-6">
          <div className="rounded-xl border border-hc-metal-light bg-white p-5">
            <h2 className="mb-3 flex items-center gap-2 font-heading text-sm font-semibold uppercase tracking-wide text-hc-gunmetal">
              <User className="h-4 w-4" aria-hidden />
              Datos de contacto
            </h2>
            <dl className="space-y-1.5 text-sm">
              <div>
                <dt className="text-hc-gunmetal">Nombre</dt>
                <dd className="text-hc-ink">{profile.name || "—"}</dd>
              </div>
              <div>
                <dt className="text-hc-gunmetal">Correo</dt>
                <dd className="break-all text-hc-ink">{profile.email || "—"}</dd>
              </div>
              <div>
                <dt className="text-hc-gunmetal">Teléfono</dt>
                <dd className="text-hc-ink">{profile.phone || "—"}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-hc-metal-light bg-white p-5">
            <h2 className="mb-3 flex items-center gap-2 font-heading text-sm font-semibold uppercase tracking-wide text-hc-gunmetal">
              <MapPin className="h-4 w-4" aria-hidden />
              Direcciones
            </h2>
            {addresses.length === 0 ? (
              <p className="text-sm text-hc-gunmetal">Sin direcciones guardadas.</p>
            ) : (
              <ul className="space-y-3">
                {addresses.map((lines, i) => (
                  <li key={i} className="text-sm leading-relaxed text-hc-ink">
                    {lines.map((l, j) => (
                      <span key={j} className="block">
                        {l}
                      </span>
                    ))}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
