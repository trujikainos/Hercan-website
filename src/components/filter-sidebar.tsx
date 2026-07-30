"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import type { FacetGroup, FacetOption } from "@/lib/catalog";

// Los tipos de faceta viven en la capa de datos (`@/lib/catalog`); se re-exportan
// aquí por retrocompatibilidad con quienes ya los importaban desde el sidebar.
export type { FacetGroup, FacetOption };

/**
 * Sidebar de filtros dirigido por URL. El filtrado/paginado ocurre en el
 * servidor; este componente solo actualiza los search params y deja que la
 * página se vuelva a renderizar. No recibe la lista de productos.
 *
 * `hiddenFacets`: params de faceta que NO se muestran (ni cuentan en "Limpiar").
 * Lo usan las páginas de taxonomía para ocultar la faceta fija (p. ej. "marca"
 * en `/marca/iscar`), que ya viaja en la ruta y no debe togglearse desde aquí.
 */
export function FilterSidebar({
  facets,
  hiddenFacets,
}: {
  facets: FacetGroup[];
  hiddenFacets?: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  // Drawer de filtros SOLO en móvil (en desktop el sidebar siempre está visible).
  const [drawerOpen, setDrawerOpen] = useState(false);

  const hidden = new Set(hiddenFacets ?? []);
  const visibleFacets = facets.filter((f) => !hidden.has(f.param));

  const activeCount = visibleFacets.reduce(
    (n, f) => n + f.options.filter((o) => o.selected).length,
    0,
  );

  // Bloquea el scroll del body mientras el drawer móvil está abierto.
  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  function navigate(params: URLSearchParams) {
    params.delete("ver"); // cualquier cambio de filtro vuelve a la primera página
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  }

  function toggle(param: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.get(param)?.split(",").filter(Boolean) ?? [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    if (next.length) params.set(param, next.join(","));
    else params.delete(param);
    navigate(params);
  }

  function clearAll() {
    const params = new URLSearchParams(searchParams.toString());
    for (const f of visibleFacets) params.delete(f.param);
    navigate(params);
  }

  // Contenido de filtros (encabezado + grupos), reutilizado en el sidebar de
  // desktop y en el drawer de móvil.
  const groups = (
    <>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-heading text-lg text-hc-navy">Filtrar</h2>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-hc-blue hover:text-hc-steel"
          >
            Limpiar ({activeCount})
          </button>
        )}
      </div>
      {visibleFacets.map((f) =>
        f.options.length === 0 ? null : (
          <FilterGroup key={f.param} facet={f} onToggle={toggle} />
        ),
      )}
    </>
  );

  return (
    <div
      style={{ opacity: isPending ? 0.6 : 1, transition: "opacity 0.15s" }}
      aria-busy={isPending}
    >
      {/* MÓVIL: botón compacto que abre el drawer (evita la lista larga apilada) */}
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        className="press flex w-full items-center justify-center gap-2 rounded-lg border border-hc-metal-light bg-white py-2.5 text-sm font-medium text-hc-navy md:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden />
        Filtros
        {activeCount > 0 && (
          <span className="ml-0.5 rounded-full bg-hc-blue px-1.5 text-xs font-semibold text-white">
            {activeCount}
          </span>
        )}
      </button>

      {/* DESKTOP: sidebar siempre visible */}
      <aside className="reveal hidden md:block">{groups}</aside>

      {/* MÓVIL: drawer deslizable (fixed → fuera del flujo del grid) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 top-0 flex max-h-[100dvh] w-[86%] max-w-sm flex-col bg-white shadow-2xl">
            <div className="flex shrink-0 items-center justify-between border-b border-hc-metal-light px-4 py-3">
              <span className="font-heading text-base text-hc-navy">Filtros</span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Cerrar filtros"
                className="flex h-8 w-8 items-center justify-center rounded-md text-hc-gunmetal hover:text-hc-navy"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">{groups}</div>
            <div className="shrink-0 border-t border-hc-metal-light p-3">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="press w-full rounded-lg bg-hc-blue py-2.5 text-sm font-semibold text-white"
              >
                Ver resultados
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Grupo de facetas colapsable. Disclosure controlado (button + aria-expanded +
 * aria-controls) en lugar de <details> nativo: así la altura se anima de forma
 * suave e interrumpible con transiciones CSS (grid-template-rows: 0fr⇄1fr).
 * No toca la lógica de filtrado: solo el motion de abrir/cerrar.
 */
function FilterGroup({
  facet,
  onToggle,
}: {
  facet: FacetGroup;
  onToggle: (param: string, value: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const contentId = useId();

  return (
    <div className="border-b border-hc-metal-light">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={contentId}
        className="hc-collapse-trigger flex w-full cursor-pointer items-center justify-between gap-4 py-2 text-left font-heading text-sm text-hc-navy"
      >
        <span>{facet.label}</span>
        <ChevronDown
          aria-hidden
          className={`hc-collapse-chevron h-4 w-4 shrink-0 text-hc-steel${open ? " is-open" : ""}`}
        />
      </button>
      <div id={contentId} className="hc-collapse" data-open={open}>
        <div className="hc-collapse-inner">
          <ul className="hc-collapse-content space-y-1.5 pb-2">
            {facet.options.map((o) => (
              <li key={o.value}>
                <label className="flex items-center gap-2 text-sm text-hc-ink">
                  <input
                    type="checkbox"
                    checked={o.selected}
                    onChange={() => onToggle(facet.param, o.value)}
                    className="accent-hc-blue"
                  />
                  <span className="flex-1">{o.label}</span>
                  <span className="text-xs text-hc-gunmetal">{o.count}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
