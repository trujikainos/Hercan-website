import { AnnouncementBar, SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/home-sections";
import { CatalogSection } from "@/components/catalog-section";
import { buildCatalog } from "@/lib/catalog";
import { getProducts, getCategories } from "@/lib/shopify";
import { JsonLd } from "@/components/json-ld";
import { pageGraph, collectionNode, breadcrumbNode } from "@/lib/schema";

export const metadata = {
  title: "Catálogo de herramentales CNC y equipos de medición",
  description:
    "Explora herramientas de corte y equipos de medición: fresado, torneado, perforación, roscado, portaherramientas y medición. Iscar, Toolmex, YG, Palbit, Mitutoyo. Filtra por especificaciones técnicas.",
  alternates: { canonical: "/productos" },
};

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const [all, categories] = await Promise.all([getProducts(), getCategories()]);

  // Catálogo universal: sin scope → todos los filtros usables.
  const result = buildCatalog({ products: all, categories, searchParams: sp });

  return (
    <>
      <JsonLd
        data={pageGraph(
          collectionNode("Catálogo", "/productos", result.filtered),
          breadcrumbNode([
            { name: "Inicio", path: "/" },
            { name: "Catálogo", path: "/productos" },
          ]),
        )}
      />
      <AnnouncementBar />
      <SiteHeader />
      <main id="contenido" className="flex-1">
        <div className="border-b border-hc-metal-light bg-hc-soft">
          <div className="reveal mx-auto max-w-7xl px-4 py-7">
            <h1 className="font-heading text-[length:var(--step-h2)] text-hc-navy">
              Catálogo
            </h1>
            <p className="text-sm text-hc-gunmetal">
              Herramientas de corte y equipos de medición
            </p>
          </div>
        </div>

        <CatalogSection result={result} basePath="/productos" />
      </main>
      <SiteFooter />
    </>
  );
}
