import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogSection } from "@/components/catalog-section";
import { TaxonomyHero, SiblingStrip } from "@/components/taxonomy";
import { JsonLd } from "@/components/json-ld";
import { pageGraph, brandNode, collectionNode, breadcrumbNode, faqNode } from "@/lib/schema";
import { buildCatalog, brandSlug } from "@/lib/catalog";
import { getProducts, getCategories } from "@/lib/shopify";
import { site } from "@/lib/site";
import { BRAND_CONTENT, BRAND_FAQS } from "@/lib/taxonomy-content";
import { FaqAccordion } from "@/components/faq-accordion";
import { MezclaTipos } from "@/components/mezcla-tipos";

// Slugs prerenderizados desde site.brands (fuente de verdad de las marcas).
export function generateStaticParams() {
  return site.brands.map((b) => ({ slug: brandSlug(b.name) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const content = BRAND_CONTENT[slug];
  if (!content) return {};
  return {
    // `absolute`: el metaTitle ya incluye "| HERCAN"; evita que el template del
    // layout (`%s | HERCAN`) lo duplique.
    title: { absolute: content.metaTitle },
    description: content.metaDescription,
    // Canonical LIMPIO a la ruta base. generateMetadata solo lee `params` (no
    // searchParams), así las facetas (?categoria=, ?material=, ?recubrimiento=,
    // ?disponibilidad=, ?ver=) canonicalizan a /marca/[slug] y consolidan señal.
    alternates: { canonical: `/marca/${slug}` },
  };
}

export default async function BrandPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const content = BRAND_CONTENT[slug];
  if (!content) notFound();

  const sp = await searchParams;
  const [all, categories] = await Promise.all([getProducts(), getCategories()]);

  // Catálogo scopeado a la marca: la faceta "marca" queda fija y OCULTA del
  // sidebar (viaja en la ruta); el resto de filtros sigue usable.
  const result = buildCatalog({
    products: all,
    categories,
    searchParams: sp,
    scope: { brand: content.name },
  });
  const basePath = `/marca/${slug}`;

  // Mezcla por tipo (productos de la marca SIN las facetas del usuario) y FAQ.
  const deLaMarca = all.filter((p) => p.brand === content.name);
  const faqs = BRAND_FAQS[slug] ?? [];

  const siblings = site.brands
    .filter((b) => brandSlug(b.name) !== slug)
    .map((b) => ({ name: b.name, href: `/marca/${brandSlug(b.name)}` }));

  return (
    <>
      <JsonLd
        data={pageGraph(
          brandNode(content.name, basePath, content.intro[0]),
          collectionNode(content.title, basePath, result.filtered),
          breadcrumbNode([
            { name: "Inicio", path: "/" },
            { name: "Marcas", path: "/marcas" },
            { name: content.name },
          ]),
          ...(faqs.length ? [faqNode(faqs)] : []),
        )}
      />
      <main id="contenido" className="flex-1">
        <TaxonomyHero
          breadcrumb={[
            { name: "Inicio", href: "/" },
            { name: "Marcas", href: "/marcas" },
            { name: content.name },
          ]}
          title={content.title}
          intro={content.intro}
        />
        <CatalogSection result={result} basePath={basePath} hiddenFacets={["marca"]} />
        <MezclaTipos
          productos={deLaMarca}
          titulo={`Qué hay de ${content.name === "YG" ? "YG-1" : content.name} en HERCAN`}
          intro="Cuántos modelos hay de cada tipo de herramienta de esta marca, con el catálogo de hoy. Cada tipo abre su página ya filtrada por la marca."
          filtro={{ param: "marca", valor: content.name }}
        />
        {faqs.length > 0 && (
          <section className="border-t border-hc-metal-light bg-hc-soft/30">
            <div className="reveal mx-auto max-w-3xl px-4 py-12">
              <h2 className="mb-4 font-heading text-[length:var(--step-h2)] text-hc-navy">
                Preguntas frecuentes sobre {content.name === "YG" ? "YG-1" : content.name}
              </h2>
              <FaqAccordion faqs={faqs} />
            </div>
          </section>
        )}
        <SiblingStrip
          heading="Otras marcas que distribuimos"
          items={siblings}
          allHref="/productos"
          allLabel="Ver todo el catálogo"
        />
      </main>
    </>
  );
}
