import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogSection } from "@/components/catalog-section";
import { TaxonomyHero, SiblingStrip } from "@/components/taxonomy";
import { JsonLd } from "@/components/json-ld";
import { pageGraph, collectionNode, breadcrumbNode } from "@/lib/schema";
import { buildCatalog } from "@/lib/catalog";
import { getProducts, getCategories } from "@/lib/shopify";
import { PARA_CONTENT } from "@/lib/taxonomy-content";

// Taxonomía "material a maquinar" (ISO 513) — la mina de oro. Scope por prefijo
// P/M/K/N/S/H sobre `materialesAMaquinar` (multi-valor). Forward-compatible: rankea
// desde ya y se enriquece cuando el Sheet separe varios materiales por SKU.
export function generateStaticParams() {
  return Object.keys(PARA_CONTENT).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const content = PARA_CONTENT[slug];
  if (!content) return {};
  return {
    title: { absolute: content.metaTitle },
    description: content.metaDescription,
    alternates: { canonical: `/para/${slug}` },
  };
}

export default async function ParaPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const content = PARA_CONTENT[slug];
  if (!content) notFound();

  const sp = await searchParams;
  const [all, categories] = await Promise.all([getProducts(), getCategories()]);

  // Scope por prefijo ISO 513 (P/M/K/N/S/H); NO es faceta del sidebar → no se oculta
  // ninguna, el resto de filtros queda usable dentro del material a maquinar.
  const result = buildCatalog({
    products: all,
    categories,
    searchParams: sp,
    scope: { para: content.code },
  });
  const basePath = `/para/${slug}`;

  const siblings = Object.entries(PARA_CONTENT)
    .filter(([s]) => s !== slug)
    .map(([s, c]) => ({ name: c.name, href: `/para/${s}` }));

  return (
    <>
      <JsonLd
        data={pageGraph(
          collectionNode(content.title, basePath, result.filtered),
          breadcrumbNode([
            { name: "Inicio", path: "/" },
            { name: "Por material", path: "/productos" },
            { name: content.name },
          ]),
        )}
      />
      <main id="contenido" className="flex-1">
        <TaxonomyHero
          breadcrumb={[
            { name: "Inicio", href: "/" },
            { name: "Por material", href: "/productos" },
            { name: content.name },
          ]}
          title={content.title}
          intro={content.intro}
        />
        <CatalogSection result={result} basePath={basePath} />
        <SiblingStrip
          heading="Herramientas por otro material"
          items={siblings}
          allHref="/productos"
          allLabel="Ver todo el catálogo"
        />
      </main>
    </>
  );
}
