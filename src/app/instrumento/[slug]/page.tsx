import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CatalogSection } from "@/components/catalog-section";
import { TaxonomyHero, SiblingStrip } from "@/components/taxonomy";
import { HUB_IMAGES } from "@/lib/hub-images";
import { FaqAccordion } from "@/components/faq-accordion";
import { JsonLd } from "@/components/json-ld";
import { pageGraph, collectionNode, breadcrumbNode, faqNode } from "@/lib/schema";
import { buildCatalog } from "@/lib/catalog";
import { getProducts, getCategories } from "@/lib/shopify";
import { INSTRUMENTO_CONTENT, INSTRUMENTO_FAQS } from "@/lib/taxonomy-content";

// Slugs prerenderizados desde los instrumentos de medición (INSTRUMENTO_CONTENT).
export function generateStaticParams() {
  return Object.keys(INSTRUMENTO_CONTENT).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const content = INSTRUMENTO_CONTENT[slug];
  if (!content) return {};
  return {
    title: { absolute: content.metaTitle },
    description: content.metaDescription,
    // Canonical LIMPIO: las facetas (?marca=, ?disponibilidad=, ?ver=) canonicalizan
    // a la ruta base y consolidan señal en una sola URL.
    alternates: { canonical: `/instrumento/${slug}` },
  };
}

export default async function InstrumentoPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const content = INSTRUMENTO_CONTENT[slug];
  if (!content) notFound();

  const sp = await searchParams;
  const [all, categories] = await Promise.all([getProducts(), getCategories()]);

  // Scopeado por `tipo_instrumento` (familia MEDICIÓN). Camino B: se muestran los
  // SKUs en existencia; lo que no hay se canaliza a cotización (CTA de abajo).
  const result = buildCatalog({
    products: all,
    categories,
    searchParams: sp,
    scope: { tipoInstrumento: content.name },
  });
  const basePath = `/instrumento/${slug}`;

  const faqs = INSTRUMENTO_FAQS[slug] ?? [];
  const siblings = Object.entries(INSTRUMENTO_CONTENT)
    .filter(([s]) => s !== slug)
    .map(([s, c]) => ({ name: c.title, href: `/instrumento/${s}` }));

  return (
    <>
      <JsonLd
        data={pageGraph(
          collectionNode(content.title, basePath, result.filtered),
          breadcrumbNode([
            { name: "Inicio", path: "/" },
            { name: "Instrumentos", path: "/instrumentos" },
            { name: content.title },
          ]),
          ...(faqs.length ? [faqNode(faqs)] : []),
        )}
      />
      <main id="contenido" className="flex-1">
        <TaxonomyHero
          breadcrumb={[
            { name: "Inicio", href: "/" },
            { name: "Instrumentos", href: "/instrumentos" },
            { name: content.title },
          ]}
          title={content.title}
          intro={content.intro}
          bullets={content.bullets}
          image={
            HUB_IMAGES.instrumento[slug]
              ? { src: HUB_IMAGES.instrumento[slug]!, alt: content.title }
              : undefined
          }
        />
        {/* La faceta "tipo" (tipo_herramienta) no aplica a medición → oculta. */}
        <CatalogSection result={result} basePath={basePath} hiddenFacets={["tipo"]} />

        {/* Sobre pedido: la búsqueda de medición supera el stock físico → cotización. */}
        <section className="border-t border-hc-metal-light bg-hc-navy/[0.03]">
          <div className="reveal mx-auto flex max-w-3xl flex-col items-start gap-3 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-heading text-xl text-hc-navy">
                ¿No encuentras el modelo que buscas?
              </h2>
              <p className="mt-1 text-sm text-hc-gunmetal">
                Conseguimos {content.title.toLowerCase()} sobre pedido de Insize, Mitutoyo y
                más. Cotiza y te respondemos en horas.
              </p>
            </div>
            <Link
              href="/cotizacion"
              data-event="generate_lead"
              className="press inline-flex shrink-0 items-center rounded-lg bg-hc-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-hc-blue"
            >
              Solicitar cotización
            </Link>
          </div>
        </section>

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
          heading="Otros instrumentos de medición"
          items={siblings}
          allHref="/productos"
          allLabel="Ver todo el catálogo"
        />
      </main>
    </>
  );
}
