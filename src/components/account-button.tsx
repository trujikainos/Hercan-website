"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  UserRound,
  LogOut,
  ChevronDown,
  Package,
  MapPin,
  LayoutDashboard,
} from "lucide-react";

/**
 * Botón de cuenta del header (client). La sesión se consulta a `/api/account/me`
 * (client-side) → el header NO lee cookies en el render del layout, así el resto del
 * sitio se mantiene estático/ISR.
 *
 * Al hacer CLIC (todos los dispositivos) abre un menú desplegable:
 *  - Con sesión: nombre + secciones de la cuenta (Resumen, Pedidos, Perfil,
 *    Direcciones) + Cerrar sesión.
 *  - Sin sesión: "Iniciar sesión / Crear cuenta" (login propio o portal Shopify).
 */
export type AccountUser = { name?: string | null; image?: string | null };

const ACCOUNT_LINKS: { href: string; label: string; Icon: typeof Package }[] = [
  { href: "/cuenta", label: "Resumen", Icon: LayoutDashboard },
  { href: "/cuenta/pedidos", label: "Mis pedidos", Icon: Package },
  { href: "/cuenta/perfil", label: "Mi perfil", Icon: UserRound },
  { href: "/cuenta/direcciones", label: "Mis direcciones", Icon: MapPin },
];

export function AccountButton({
  enabled,
  loginUrl,
  logoutUrl = "/account/logout",
}: {
  /** true si el Customer Account API está configurado → consultamos la sesión. */
  enabled: boolean;
  /** Destino al NO haber sesión (login propio o portal de Shopify). */
  loginUrl: string;
  logoutUrl?: string;
}) {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    fetch("/api/account/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d?.user) setUser(d.user as AccountUser);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [enabled]);

  // Cerrar el menú al clic fuera o con Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const name = user?.name?.trim() || "";
  const initial = name.charAt(0).toUpperCase();
  const loggedIn = Boolean(user);

  const avatar = (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-hc-navy to-hc-steel text-white ring-1 ring-hc-metal-light transition group-hover:ring-hc-steel">
      {user?.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={user.image} alt="" className="h-full w-full object-cover" />
      ) : initial ? (
        <span className="font-heading text-sm font-semibold">{initial}</span>
      ) : (
        <UserRound className="h-[18px] w-[18px]" aria-hidden />
      )}
    </span>
  );

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        aria-label={loggedIn ? `Mi cuenta${name ? `: ${name}` : ""}` : "Cuenta"}
        className="group flex items-center gap-2 rounded-full p-0.5 transition-colors hover:bg-hc-soft sm:pr-2.5"
      >
        {avatar}
        <span className="hidden flex-col text-left leading-tight sm:flex">
          <span className="max-w-[9rem] truncate text-sm font-medium text-hc-navy">
            {loggedIn ? name || "Mi cuenta" : "Ingresar"}
          </span>
          <span className="text-[11px] text-hc-gunmetal">
            {loggedIn ? "Mi cuenta" : "o crear cuenta"}
          </span>
        </span>
        <ChevronDown
          className={`hidden h-4 w-4 text-hc-gunmetal transition-transform duration-200 sm:block ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-[60] mt-2 w-56 overflow-hidden rounded-xl border border-hc-metal-light bg-white py-1 text-hc-ink shadow-xl motion-safe:animate-[fadeUp_0.14s_ease-out]"
        >
          {loggedIn ? (
            <>
              <div className="border-b border-hc-metal-light px-4 py-2.5">
                <p className="truncate font-heading text-sm font-semibold text-hc-navy">
                  {name || "Mi cuenta"}
                </p>
                <p className="text-[11px] text-hc-gunmetal">Bienvenido de vuelta</p>
              </div>
              {ACCOUNT_LINKS.map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-hc-soft hover:text-hc-navy"
                >
                  <Icon className="h-4 w-4 shrink-0 text-hc-steel" aria-hidden />
                  {label}
                </Link>
              ))}
              <a
                href={logoutUrl}
                role="menuitem"
                className="flex items-center gap-3 border-t border-hc-metal-light px-4 py-2.5 text-sm text-hc-gunmetal transition-colors hover:bg-hc-soft hover:text-hc-navy"
              >
                <LogOut className="h-4 w-4 shrink-0" aria-hidden />
                Cerrar sesión
              </a>
            </>
          ) : (
            <a
              href={loginUrl}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-hc-soft hover:text-hc-navy"
            >
              <UserRound className="h-4 w-4 shrink-0 text-hc-steel" aria-hidden />
              Iniciar sesión / Crear cuenta
            </a>
          )}
        </div>
      )}
    </div>
  );
}
