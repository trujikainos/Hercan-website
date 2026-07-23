import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogSection } from "@/components/catalog-section";
import { TaxonomyHero, SiblingStrip } from "@/components/taxonomy";
import { JsonLd } from "@/components/json-ld";
import { pageGraph, collectionNode, breadcrumbNode } from "@/lib/schema";
import { buildCatalog } from "@/lib/catalog";
import { getProducts, getCategories } from "@/lib/shopify";
import { ISO_CONTENT } from "@/lib/taxonomy-content";

// Slugs prerenderizados desde las familias ISO curadas (ISO_CONTENT).
export function generateStaticParams() {
  return Object.keys(ISO_CONTENT).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const content = ISO_CONTENT[slug];
  if (!content) return {};
  return {
    // `absolute`: el metaTitle ya incluye "| HERCAN"; evita que el template del
    // layout (`%s | HERCAN`) lo duplique.
    title: { absolute: content.metaTitle },
    description: content.metaDescription,
    // Canonical LIMPIO a la ruta base. generateMetadata solo lee `params` (no
    // searchParams), así las facetas (?categoria=, ?marca=, ?material=,
    // ?recubrimiento=, ?disponibilidad=, ?ver=) canonicalizan a /iso/[slug].
    alternates: { canonical: `/iso/${slug}` },
  };
}

export default async function IsoPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const content = ISO_CONTENT[slug];
  if (!content) notFound();

  const sp = await searchParams;
  const [all, categories] = await Promise.all([getProducts(), getCategories()]);

  // Catálogo scopeado a la familia ISO (prefijo de designacion_iso). No es una
  // faceta del sidebar (vive en la ruta), así que no se oculta ningún grupo.
  // FORWARD-COMPATIBLE: hoy puede dar 0 productos (el catálogo aún se importa) y
  // el hero informativo se muestra igual.
  const result = buildCatalog({
    products: all,
    categories,
    searchParams: sp,
    scope: { iso: content.code },
  });
  const basePath = `/iso/${slug}`;

  const siblings = Object.entries(ISO_CONTENT)
    .filter(([s]) => s !== slug)
    .map(([s, c]) => ({ name: c.code, href: `/iso/${s}` }));

  return (
    <>
      <JsonLd
        data={pageGraph(
          collectionNode(content.title, basePath, result.filtered),
          breadcrumbNode([
            { name: "Inicio", path: "/" },
            { name: "Designación ISO", path: "/productos" },
            { name: content.code },
          ]),
        )}
      />
      <main id="contenido" className="flex-1">
        <TaxonomyHero
          breadcrumb={[
            { name: "Inicio", href: "/" },
            { name: "Designación ISO", href: "/productos" },
            { name: content.code },
          ]}
          title={content.title}
          intro={content.intro}
          bullets={content.bullets}
        />
        <CatalogSection result={result} basePath={basePath} />
        <SiblingStrip
          heading="Otras familias ISO"
          items={siblings}
          allHref="/productos"
          allLabel="Ver todo el catálogo"
        />
      </main>
    </>
  );
}
