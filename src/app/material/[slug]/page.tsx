import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogSection } from "@/components/catalog-section";
import { TaxonomyHero, SiblingStrip } from "@/components/taxonomy";
import { JsonLd } from "@/components/json-ld";
import { pageGraph, collectionNode, breadcrumbNode } from "@/lib/schema";
import { buildCatalog } from "@/lib/catalog";
import { getProducts, getCategories } from "@/lib/shopify";
import { MATERIAL_CONTENT } from "@/lib/taxonomy-content";

// Slugs prerenderizados desde los materiales de herramienta (MATERIAL_CONTENT).
export function generateStaticParams() {
  return Object.keys(MATERIAL_CONTENT).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const content = MATERIAL_CONTENT[slug];
  if (!content) return {};
  return {
    // `absolute`: el metaTitle ya incluye "| HERCAN"; evita que el template del
    // layout (`%s | HERCAN`) lo duplique.
    title: { absolute: content.metaTitle },
    description: content.metaDescription,
    // Canonical LIMPIO a la ruta base. generateMetadata solo lee `params` (no
    // searchParams), así las facetas (?categoria=, ?marca=, ?recubrimiento=,
    // ?disponibilidad=, ?ver=) canonicalizan a /material/[slug] y consolidan
    // señal en una sola URL en vez de generar duplicados por combinación.
    alternates: { canonical: `/material/${slug}` },
  };
}

export default async function MaterialPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const content = MATERIAL_CONTENT[slug];
  if (!content) notFound();

  const sp = await searchParams;
  const [all, categories] = await Promise.all([getProducts(), getCategories()]);

  // Catálogo scopeado al material de herramienta: la faceta "material" queda fija
  // y OCULTA del sidebar (viaja en la ruta); categoría, marca, recubrimiento y
  // disponibilidad siguen usables.
  const result = buildCatalog({
    products: all,
    categories,
    searchParams: sp,
    scope: { material: content.name },
  });
  const basePath = `/material/${slug}`;

  const siblings = Object.entries(MATERIAL_CONTENT)
    .filter(([s]) => s !== slug)
    .map(([s, c]) => ({ name: c.title, href: `/material/${s}` }));

  return (
    <>
      <JsonLd
        data={pageGraph(
          collectionNode(content.title, basePath, result.filtered),
          breadcrumbNode([
            { name: "Inicio", path: "/" },
            { name: "Materiales", path: "/materiales" },
            { name: content.title },
          ]),
        )}
      />
      <main id="contenido" className="flex-1">
        <TaxonomyHero
          breadcrumb={[
            { name: "Inicio", href: "/" },
            { name: "Materiales", href: "/materiales" },
            { name: content.title },
          ]}
          title={content.title}
          intro={content.intro}
          bullets={content.bullets}
        />
        <CatalogSection
          result={result}
          basePath={basePath}
          hiddenFacets={["material"]}
        />
        <SiblingStrip
          heading="Otros materiales de herramienta"
          items={siblings}
          allHref="/productos"
          allLabel="Ver todo el catálogo"
        />
      </main>
    </>
  );
}
