"use client";

import { useId, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

export type FacetOption = {
  value: string; // valor que va en la URL (slug para categoría, valor para el resto)
  label: string;
  count: number;
  selected: boolean;
};
export type FacetGroup = {
  param: string;
  label: string;
  options: FacetOption[];
};

/**
 * Sidebar de filtros dirigido por URL. El filtrado/paginado ocurre en el
 * servidor; este componente solo actualiza los search params y deja que la
 * página se vuelva a renderizar. No recibe la lista de productos.
 */
export function FilterSidebar({ facets }: { facets: FacetGroup[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const activeCount = facets.reduce(
    (n, f) => n + f.options.filter((o) => o.selected).length,
    0,
  );

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
    for (const f of facets) params.delete(f.param);
    navigate(params);
  }

  return (
    <aside
      className="reveal"
      style={{ opacity: isPending ? 0.6 : 1, transition: "opacity 0.15s" }}
      aria-busy={isPending}
    >
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
      {facets.map((f) =>
        f.options.length === 0 ? null : (
          <FilterGroup key={f.param} facet={f} onToggle={toggle} />
        ),
      )}
    </aside>
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
