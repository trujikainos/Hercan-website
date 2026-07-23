import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { AnnouncementBar, SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/home-sections";
import { CatalogSection } from "@/components/catalog-section";
import { buildCatalog, searchProductsLocal } from "@/lib/catalog";
import { getProducts, getCategories } from "@/lib/shopify";

// Las páginas de RESULTADOS de búsqueda no se indexan (evita thin/duplicate
// content); el SEO lo capturan las taxonomías. Se siguen los enlaces (follow).
export const metadata: Metadata = {
  title: { absolute: "Buscar productos | HERCAN" },
  description:
    "Busca en el catálogo de herramentales CNC y equipos de medición de HERCAN por nombre, SKU, N° de parte, marca, categoría o especificación.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/buscar" },
};

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const qRaw = Array.isArray(sp.q) ? sp.q[0] : (sp.q ?? "");
  const q = qRaw.trim();
  const hasQuery = q.length >= 2;

  const [all, categories] = await Promise.all([getProducts(), getCategories()]);
  // Búsqueda de texto → subconjunto; buildCatalog aplica facetas + paginación
  // sobre ese subconjunto (los resultados de búsqueda se pueden filtrar).
  const matched = hasQuery ? searchProductsLocal(all, q) : [];
  const result = buildCatalog({ products: matched, categories, searchParams: sp });

  return (
    <>
      <AnnouncementBar />
      <SiteHeader />
      <main id="contenido" className="flex-1">
        <section className="border-b border-hc-metal-light bg-hc-soft">
          <div className="mx-auto max-w-7xl px-4 py-8">
            <div className="flex items-center gap-1.5 text-sm text-hc-gunmetal">
              <Search className="h-4 w-4" aria-hidden />
              Búsqueda
            </div>
            <h1 className="mt-2 font-heading text-[length:var(--step-h2)] text-hc-navy">
              {q ? <>Resultados para “{q}”</> : "Buscar productos"}
            </h1>
            <p className="mt-2 text-sm text-hc-gunmetal">
              {!hasQuery
                ? "Escribe al menos 2 caracteres en el buscador de arriba para ver resultados."
                : `${result.total} ${result.total === 1 ? "producto" : "productos"} para tu búsqueda.`}
            </p>
          </div>
        </section>

        {hasQuery && matched.length > 0 ? (
          <CatalogSection result={result} basePath="/buscar" />
        ) : hasQuery ? (
          <div className="mx-auto max-w-3xl px-4 py-16 text-center">
            <p className="text-hc-gunmetal">
              No encontramos productos para “{q}”. Revisa la ortografía o prueba con
              un término más general (una marca, un tipo o una categoría).
            </p>
            <Link
              href="/productos"
              className="press mt-5 inline-flex items-center rounded-lg border border-hc-blue px-5 py-2.5 text-sm font-medium text-hc-blue transition hover:bg-hc-soft"
            >
              Ver todo el catálogo
            </Link>
          </div>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}
