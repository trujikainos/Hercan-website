import Link from "next/link";
import { LogOut, LayoutDashboard, MapPin, Package, User } from "lucide-react";

export type AccountSection = "resumen" | "pedidos" | "perfil" | "direcciones";

const TABS: { key: AccountSection; label: string; href: string; icon: typeof User }[] = [
  { key: "resumen", label: "Resumen", href: "/cuenta", icon: LayoutDashboard },
  { key: "pedidos", label: "Pedidos", href: "/cuenta/pedidos", icon: Package },
  { key: "perfil", label: "Mis datos", href: "/cuenta/perfil", icon: User },
  { key: "direcciones", label: "Direcciones", href: "/cuenta/direcciones", icon: MapPin },
];

export function AccountShell({
  name,
  email,
  active,
  children,
}: {
  name: string;
  email: string;
  active: AccountSection;
  children: React.ReactNode;
}) {
  const initial = (name || email || "?").charAt(0).toUpperCase();
  return (
    <main id="contenido" className="flex-1">
      {/* Encabezado */}
      <section className="border-b border-hc-metal-light bg-hc-soft">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-8">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-hc-navy to-hc-steel font-heading text-lg font-semibold text-white">
              {initial}
            </span>
            <div>
              <h1 className="font-heading text-[length:var(--step-h2)] leading-tight text-hc-navy">
                {name || "Mi cuenta"}
              </h1>
              <p className="text-sm text-hc-gunmetal">{email}</p>
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

      {/* Navegación por secciones */}
      <nav className="border-b border-hc-metal-light bg-white">
        <div className="no-scrollbar mx-auto flex max-w-5xl gap-1 overflow-x-auto overflow-y-hidden px-4">
          {TABS.map((t) => {
            const on = t.key === active;
            const Icon = t.icon;
            return (
              <Link
                key={t.key}
                href={t.href}
                aria-current={on ? "page" : undefined}
                className={`-mb-px flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                  on
                    ? "border-hc-blue text-hc-blue"
                    : "border-transparent text-hc-gunmetal hover:text-hc-navy"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {t.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-4 py-8">{children}</div>
    </main>
  );
}
