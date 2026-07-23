import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { FilterSidebar } from "@/components/filter-sidebar";
import type { CatalogResult } from "@/lib/catalog";

/**
 * Cuerpo del catálogo (sidebar de filtros + grid + "Mostrar más"), compartido
 * por `/productos` y las páginas de taxonomía. Es presentacional: recibe el
 * resultado ya calculado por `buildCatalog`.
 *
 * - `basePath`: ruta base para el enlace "Mostrar más" ("/productos",
 *   "/marca/iscar", "/categoria/fresado"…). El sidebar navega solo con el
 *   pathname actual, así que no necesita basePath.
 * - `hiddenFacets`: grupos de faceta a ocultar (la faceta fija de la taxonomía).
 */
export function CatalogSection({
  result,
  basePath,
  hiddenFacets,
}: {
  result: CatalogResult;
  basePath: string;
  hiddenFacets?: string[];
}) {
  const { shown, facetGroups, hasMore, moreQuery, total, remaining } = result;

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
      <FilterSidebar facets={facetGroups} hiddenFacets={hiddenFacets} />

      <section>
        <p className="mb-3 text-sm text-hc-gunmetal">
          {total} producto{total === 1 ? "" : "s"}
        </p>
        <div className="stagger-in grid grid-cols-2 gap-3 sm:grid-cols-3">
          {shown.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        {hasMore && (
          <div className="mt-6 flex justify-center">
            <Link
              href={`${basePath}?${moreQuery}`}
              scroll={false}
              className="press inline-flex items-center gap-2 rounded-lg border border-hc-blue px-5 py-2.5 text-sm font-medium text-hc-blue transition hover:bg-hc-soft"
            >
              Mostrar más ({remaining})
              <ChevronDown className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        )}

        {total === 0 && (
          <p className="py-12 text-center text-hc-gunmetal">
            Sin resultados con esos filtros.
          </p>
        )}
      </section>
    </div>
  );
}
