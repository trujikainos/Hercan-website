import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, LogOut, MapPin, Package, User } from "lucide-react";
import { getCustomerAccount } from "@/lib/customer-account";
import { AccountShell } from "@/components/account/account-shell";
import { OrderCard } from "@/components/account/order-card";
import { money, fmtDate } from "@/components/account/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { absolute: "Mi cuenta | HERCAN" },
  robots: { index: false, follow: false },
};

const SECTIONS = [
  { href: "/cuenta/pedidos", label: "Pedidos", desc: "Historial, rastreo y volver a pedir", icon: Package },
  { href: "/cuenta/perfil", label: "Mis datos", desc: "Nombre y datos de contacto", icon: User },
  { href: "/cuenta/direcciones", label: "Direcciones", desc: "Direcciones de envío", icon: MapPin },
];

export default async function CuentaPage() {
  const acc = await getCustomerAccount();
  if (!acc) redirect("/account/login");

  if ("error" in acc) {
    return (
      <main id="contenido" className="mx-auto max-w-3xl flex-1 px-4 py-16 text-center">
        <h1 className="font-heading text-2xl text-hc-navy">Mi cuenta</h1>
        <p className="mt-3 text-hc-gunmetal">
          No pudimos cargar tu información en este momento. Vuelve a intentarlo en unos segundos.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/cuenta" className="press rounded-lg bg-hc-steel px-4 py-2 text-sm font-medium text-white hover:bg-hc-blue">
            Reintentar
          </Link>
          <a href="/account/logout" className="press inline-flex items-center gap-1 rounded-lg border border-hc-metal-light px-4 py-2 text-sm font-medium text-hc-navy hover:border-hc-steel">
            <LogOut className="h-4 w-4" aria-hidden /> Cerrar sesión
          </a>
        </div>
      </main>
    );
  }

  const { profile, orders } = acc;
  const currency = orders.find((o) => o.total)?.total?.currencyCode ?? "MXN";
  const totalSpent = orders.reduce((s, o) => s + (o.total ? Number(o.total.amount) || 0 : 0), 0);
  const stats = [
    { label: "Pedidos recientes", value: String(orders.length) },
    { label: "Total (recientes)", value: money({ amount: String(totalSpent), currencyCode: currency }) },
    { label: "Último pedido", value: orders[0] ? fmtDate(orders[0].processedAt) : "—" },
  ];
  const recent = orders.slice(0, 3);

  return (
    <AccountShell name={profile.name} email={profile.email} active="resumen">
      {/* Resumen de compras */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-hc-metal-light bg-white p-4 text-center">
            <p className="font-heading text-xl text-hc-navy sm:text-2xl">{s.value}</p>
            <p className="mt-0.5 text-[11px] uppercase tracking-wide text-hc-gunmetal sm:text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Accesos a las secciones */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.href}
              href={s.href}
              className="group flex flex-col rounded-xl border border-hc-metal-light bg-white p-4 transition hover:border-hc-steel"
            >
              <Icon className="h-5 w-5 text-hc-steel" aria-hidden />
              <span className="mt-2 font-heading text-hc-navy group-hover:text-hc-blue">{s.label}</span>
              <span className="mt-0.5 text-xs text-hc-gunmetal">{s.desc}</span>
            </Link>
          );
        })}
      </div>

      {/* Pedidos recientes */}
      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-heading text-xl text-hc-navy">
            <Package className="h-5 w-5 text-hc-steel" aria-hidden /> Pedidos recientes
          </h2>
          {orders.length > 0 && (
            <Link href="/cuenta/pedidos" className="inline-flex items-center gap-1 text-sm font-medium text-hc-blue hover:text-hc-steel">
              Ver todos <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          )}
        </div>
        {recent.length === 0 ? (
          <div className="rounded-xl border border-dashed border-hc-metal-light bg-white p-8 text-center">
            <p className="text-sm text-hc-gunmetal">Aún no tienes pedidos.</p>
            <Link href="/productos" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-hc-blue hover:text-hc-steel">
              Explorar el catálogo <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map((o) => (
              <OrderCard key={o.id} order={o} />
            ))}
          </div>
        )}
      </div>
    </AccountShell>
  );
}
