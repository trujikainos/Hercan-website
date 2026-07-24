"use client";

import { useEffect, useState } from "react";
import { UserRound, LogOut } from "lucide-react";

/**
 * Botón de cuenta del header (client). La sesión se consulta a `/api/account/me`
 * (client-side) → el header NO lee cookies en el render del layout, así el resto del
 * sitio se mantiene estático/ISR. Con sesión muestra inicial/foto + nombre + "Salir";
 * sin sesión, "Ingresar" (arranca el login propio o el portal de Shopify según config).
 */
export type AccountUser = { name?: string | null; image?: string | null };

export function AccountButton({
  enabled,
  loginUrl,
  accountUrl,
  logoutUrl = "/account/logout",
}: {
  /** true si el Customer Account API está configurado → consultamos la sesión. */
  enabled: boolean;
  /** Destino al NO haber sesión (login propio o portal de Shopify). */
  loginUrl: string;
  /** Portal de cuenta de Shopify cuando hay sesión. */
  accountUrl: string;
  logoutUrl?: string;
}) {
  const [user, setUser] = useState<AccountUser | null>(null);

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

  const name = user?.name?.trim() || "";
  const initial = name.charAt(0).toUpperCase();

  if (!user) {
    return (
      <a
        href={loginUrl}
        aria-label="Iniciar sesión o crear cuenta"
        className="group flex items-center gap-2 rounded-full p-0.5 transition-colors hover:bg-hc-soft sm:pr-2.5"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-hc-navy to-hc-steel text-white ring-1 ring-hc-metal-light transition group-hover:ring-hc-steel">
          <UserRound className="h-[18px] w-[18px]" aria-hidden />
        </span>
        <span className="hidden flex-col text-left leading-tight sm:flex">
          <span className="text-sm font-medium text-hc-navy">Ingresar</span>
          <span className="text-[11px] text-hc-gunmetal">o crear cuenta</span>
        </span>
      </a>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <a
        href={accountUrl}
        aria-label={`Mi cuenta${name ? `: ${name}` : ""}`}
        className="group flex items-center gap-2 rounded-full p-0.5 transition-colors hover:bg-hc-soft sm:pr-2.5"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-hc-navy to-hc-steel text-white ring-1 ring-hc-metal-light transition group-hover:ring-hc-steel">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt="" className="h-full w-full object-cover" />
          ) : initial ? (
            <span className="font-heading text-sm font-semibold">{initial}</span>
          ) : (
            <UserRound className="h-[18px] w-[18px]" aria-hidden />
          )}
        </span>
        <span className="hidden flex-col text-left leading-tight sm:flex">
          <span className="max-w-[9rem] truncate text-sm font-medium text-hc-navy">
            {name || "Mi cuenta"}
          </span>
          <span className="text-[11px] text-hc-gunmetal">Mi cuenta</span>
        </span>
      </a>
      <a
        href={logoutUrl}
        aria-label="Cerrar sesión"
        title="Cerrar sesión"
        className="hidden rounded-full p-2 text-hc-gunmetal transition-colors hover:bg-hc-soft hover:text-hc-navy sm:inline-flex"
      >
        <LogOut className="h-4 w-4" aria-hidden />
      </a>
    </div>
  );
}
