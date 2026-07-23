import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AnnouncementBar, SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/home-sections";
import { CatalogSection } from "@/components/catalog-section";
import { TaxonomyHero, SiblingStrip } from "@/components/taxonomy";
import { JsonLd } from "@/components/json-ld";
import { pageGraph, collectionNode, breadcrumbNode } from "@/lib/schema";
import { buildCatalog } from "@/lib/catalog";
import { getProducts, getCategories } from "@/lib/shopify";
import { CATEGORY_CONTENT } from "@/lib/taxonomy-content";

// Slugs prerenderizados desde las 9 categorías del negocio (CATEGORY_CONTENT).
export function generateStaticParams() {
  return Object.keys(CATEGORY_CONTENT).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const content = CATEGORY_CONTENT[slug];
  if (!content) return {};
  return {
    // `absolute`: el metaTitle ya incluye "| HERCAN"; evita que el template del
    // layout (`%s | HERCAN`) lo duplique.
    title: { absolute: content.metaTitle },
    description: content.metaDescription,
    alternates: { canonical: `/categoria/${slug}` },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const content = CATEGORY_CONTENT[slug];
  if (!content) notFound();

  const sp = await searchParams;
  const [all, categories] = await Promise.all([getProducts(), getCategories()]);

  // Catálogo scopeado a la categoría: la faceta "categoría" queda fija y OCULTA
  // del sidebar (viaja en la ruta); marca, material, recubrimiento y
  // disponibilidad siguen usables.
  const result = buildCatalog({
    products: all,
    categories,
    searchParams: sp,
    scope: { category: content.name },
  });
  const basePath = `/categoria/${slug}`;

  const siblings = Object.entries(CATEGORY_CONTENT)
    .filter(([s]) => s !== slug)
    .map(([s, c]) => ({ name: c.title, href: `/categoria/${s}` }));

  return (
    <>
      <JsonLd
        data={pageGraph(
          collectionNode(content.title, basePath, result.filtered),
          breadcrumbNode([
            { name: "Inicio", path: "/" },
            { name: "Categorías", path: "/productos" },
            { name: content.title },
          ]),
        )}
      />
      <AnnouncementBar />
      <SiteHeader />
      <main id="contenido" className="flex-1">
        <TaxonomyHero
          breadcrumb={[
            { name: "Inicio", href: "/" },
            { name: "Categorías", href: "/productos" },
            { name: content.title },
          ]}
          title={content.title}
          intro={content.intro}
          bullets={content.bullets}
        />
        <CatalogSection
          result={result}
          basePath={basePath}
          hiddenFacets={["categoria"]}
        />
        <SiblingStrip
          heading="Otras categorías"
          items={siblings}
          allHref="/productos"
          allLabel="Ver todo el catálogo"
        />
      </main>
      <SiteFooter />
    </>
  );
}
