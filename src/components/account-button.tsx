import { UserRound } from "lucide-react";

/**
 * Botón de cuenta del header. HOY el sitio no conoce la sesión (el login vive en el
 * portal de Shopify, en su propio dominio), así que `user` llega null → estado
 * "Ingresar". Queda LISTO para cuando conectemos el Customer Account API de Shopify:
 * al pasar `user`, muestra foto → o inicial en un círculo → y el nombre.
 */
export type AccountUser = { name?: string | null; image?: string | null };

export function AccountButton({
  user,
  accountUrl,
}: {
  user?: AccountUser | null;
  accountUrl: string;
}) {
  const name = user?.name?.trim() || "";
  const initial = name.charAt(0).toUpperCase();

  return (
    <a
      href={accountUrl}
      aria-label={user ? `Mi cuenta${name ? `: ${name}` : ""}` : "Iniciar sesión o crear cuenta"}
      className="group flex items-center gap-2 rounded-full p-0.5 transition-colors hover:bg-hc-soft sm:pr-2.5"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-hc-navy to-hc-steel text-white ring-1 ring-hc-metal-light transition group-hover:ring-hc-steel">
        {user?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt="" className="h-full w-full object-cover" />
        ) : user && initial ? (
          <span className="font-heading text-sm font-semibold">{initial}</span>
        ) : (
          <UserRound className="h-[18px] w-[18px]" aria-hidden />
        )}
      </span>
      <span className="hidden flex-col text-left leading-tight sm:flex">
        {user ? (
          <>
            <span className="max-w-[9rem] truncate text-sm font-medium text-hc-navy">
              {name || "Mi cuenta"}
            </span>
            <span className="text-[11px] text-hc-gunmetal">Mi cuenta</span>
          </>
        ) : (
          <>
            <span className="text-sm font-medium text-hc-navy">Ingresar</span>
            <span className="text-[11px] text-hc-gunmetal">o crear cuenta</span>
          </>
        )}
      </span>
    </a>
  );
}
