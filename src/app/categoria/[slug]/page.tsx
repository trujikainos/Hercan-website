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
import { CATEGORY_CONTENT, CATEGORY_FAQS } from "@/lib/taxonomy-content";
import { RelatedGuides } from "@/components/related-guides";
import { MedidasTabla } from "@/components/medidas-tabla";
import { MezclaTipos } from "@/components/mezcla-tipos";

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
    // Canonical LIMPIO a la ruta base. generateMetadata solo lee `params` (no
    // searchParams), así las facetas (?marca=, ?material=, ?recubrimiento=,
    // ?disponibilidad=, ?ver=) canonicalizan a /categoria/[slug] y consolidan
    // señal en una sola URL en vez de generar duplicados por combinación.
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

  // FAQ factual de maquinado (visible + FAQPage). Fuente única en taxonomy-content
  // → el texto del acordeón y el del schema coinciden exactamente. Puede no existir
  // para categorías genéricas (p. ej. accesorios): entonces no se renderiza el bloque.
  const faqs = CATEGORY_FAQS[slug] ?? [];

  // Mezcla por tipo: productos de la categoría SIN las facetas del usuario, y el
  // slug real de la faceta `categoria` (el de la ruta no siempre coincide).
  const enCategoria = all.filter((p) => p.category === content.name);
  const catSlug = categories.find((c) => c.name === content.name)?.slug ?? slug;
  // Solo la primera letra en minúscula: respeta siglas ("para CNC").
  const enMinuscula = content.title.charAt(0).toLowerCase() + content.title.slice(1);

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
            { name: "Categorías", path: "/categorias" },
            { name: content.title },
          ]),
          ...(faqs.length ? [faqNode(faqs)] : []),
        )}
      />
      <main id="contenido" className="flex-1">
        <TaxonomyHero
          breadcrumb={[
            { name: "Inicio", href: "/" },
            { name: "Categorías", href: "/categorias" },
            { name: content.title },
          ]}
          title={content.title}
          intro={content.intro}
          bullets={content.bullets}
          image={
            HUB_IMAGES.categoria[slug]
              ? { src: HUB_IMAGES.categoria[slug]!, alt: content.title }
              : undefined
          }
        />
        <CatalogSection
          result={result}
          basePath={basePath}
          hiddenFacets={["categoria"]}
        />
        <MezclaTipos
          productos={enCategoria}
          titulo={`${content.title} por tipo`}
          intro={`Cuántos modelos hay de cada tipo en ${enMinuscula}, con el catálogo de hoy. Cada tipo abre su página ya filtrada.`}
          filtro={{ param: "categoria", valor: catSlug }}
        />
        {content.medidas && <MedidasTabla medidas={content.medidas} productos={all} />}
        {faqs.length > 0 && (
          <section className="border-t border-hc-metal-light bg-hc-soft/30">
            <div className="reveal mx-auto max-w-3xl px-4 py-12">
              <h2 className="mb-4 font-heading text-[length:var(--step-h2)] text-hc-navy">
                Preguntas frecuentes sobre {enMinuscula}
              </h2>
              <FaqAccordion faqs={faqs} />
            </div>
          </section>
        )}
        <RelatedGuides ns="categoria" slug={slug} />
        <SiblingStrip
          heading="Otras categorías"
          items={siblings}
          allHref="/productos"
          allLabel="Ver todo el catálogo"
        />
      </main>
    </>
  );
}
