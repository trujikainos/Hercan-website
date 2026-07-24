import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogSection } from "@/components/catalog-section";
import { TaxonomyHero, SiblingStrip } from "@/components/taxonomy";
import { HUB_IMAGES } from "@/lib/hub-images";
import { FaqAccordion } from "@/components/faq-accordion";
import { JsonLd } from "@/components/json-ld";
import { pageGraph, collectionNode, breadcrumbNode, faqNode } from "@/lib/schema";
import { buildCatalog } from "@/lib/catalog";
import { getProducts, getCategories } from "@/lib/shopify";
import { TIPO_CONTENT, TIPO_FAQS } from "@/lib/taxonomy-content";

// Slugs prerenderizados desde los tipos de herramienta del negocio (TIPO_CONTENT).
export function generateStaticParams() {
  return Object.keys(TIPO_CONTENT).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const content = TIPO_CONTENT[slug];
  if (!content) return {};
  return {
    // `absolute`: el metaTitle ya incluye "| HERCAN"; evita que el template del
    // layout (`%s | HERCAN`) lo duplique.
    title: { absolute: content.metaTitle },
    description: content.metaDescription,
    // Canonical LIMPIO a la ruta base. generateMetadata solo lee `params` (no
    // searchParams), así las facetas (?categoria=, ?marca=, ?material=,
    // ?recubrimiento=, ?disponibilidad=, ?ver=) canonicalizan a /tipo/[slug].
    alternates: { canonical: `/tipo/${slug}` },
  };
}

export default async function TipoPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const content = TIPO_CONTENT[slug];
  if (!content) notFound();

  const sp = await searchParams;
  const [all, categories] = await Promise.all([getProducts(), getCategories()]);

  // Catálogo scopeado al tipo de herramienta (tipo_herramienta). No es una faceta
  // del sidebar (vive en la ruta), así que no se oculta ningún grupo: categoría,
  // marca, material, recubrimiento y disponibilidad siguen usables.
  const result = buildCatalog({
    products: all,
    categories,
    searchParams: sp,
    scope: { tipo: content.name },
  });
  const basePath = `/tipo/${slug}`;

  // FAQ factual de maquinado (visible + FAQPage), misma fuente única que el schema.
  const faqs = TIPO_FAQS[slug] ?? [];

  const siblings = Object.entries(TIPO_CONTENT)
    .filter(([s]) => s !== slug)
    .map(([s, c]) => ({ name: c.title, href: `/tipo/${s}` }));

  return (
    <>
      <JsonLd
        data={pageGraph(
          collectionNode(content.title, basePath, result.filtered),
          breadcrumbNode([
            { name: "Inicio", path: "/" },
            { name: "Tipos", path: "/tipos" },
            { name: content.title },
          ]),
          ...(faqs.length ? [faqNode(faqs)] : []),
        )}
      />
      <main id="contenido" className="flex-1">
        <TaxonomyHero
          breadcrumb={[
            { name: "Inicio", href: "/" },
            { name: "Tipos", href: "/tipos" },
            { name: content.title },
          ]}
          title={content.title}
          intro={content.intro}
          bullets={content.bullets}
          image={
            HUB_IMAGES.tipo[slug]
              ? { src: HUB_IMAGES.tipo[slug]!, alt: content.title }
              : undefined
          }
        />
        <CatalogSection result={result} basePath={basePath} />
        {faqs.length > 0 && (
          <section className="border-t border-hc-metal-light bg-hc-soft/30">
            <div className="reveal mx-auto max-w-3xl px-4 py-12">
              <h2 className="mb-4 font-heading text-[length:var(--step-h2)] text-hc-navy">
                Preguntas frecuentes sobre {content.title.toLowerCase()}
              </h2>
              <FaqAccordion faqs={faqs} />
            </div>
          </section>
        )}
        <SiblingStrip
          heading="Otros tipos de herramienta"
          items={siblings}
          allHref="/productos"
          allLabel="Ver todo el catálogo"
        />
      </main>
    </>
  );
}
