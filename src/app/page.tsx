import {
  Hero,
  BrandBar,
  ValueProps,
  CategoryGrid,
  BrandsSection,
  QuoteCTA,
  SeoBlock,
} from "@/components/home-sections";
import { ProductCard } from "@/components/product-card";
import { FaqAccordion } from "@/components/faq-accordion";
import { getProducts, getCategories } from "@/lib/shopify";
import { JsonLd } from "@/components/json-ld";
import { pageGraph, faqNode } from "@/lib/schema";
import { HOME_FAQS } from "@/lib/faq";

export const metadata = {
  title: "Herramientas de corte para CNC y equipos de medición",
  description:
    "Distribuidor B2B de herramental para CNC en México: insertos, fresas y brocas de carburo, portaherramientas y equipos de medición Mitutoyo. Iscar, Toolmex, YG, Palbit. Compra en línea o cotización por volumen.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    getProducts(8),
    getCategories(),
  ]);
  const featured = products.slice(0, 8);

  return (
    <>
      <JsonLd data={pageGraph(faqNode(HOME_FAQS))} />
      <main id="contenido" className="flex-1">
        <Hero />
        <BrandBar />
        <CategoryGrid categories={categories} />
        <ValueProps />

        <section className="mx-auto max-w-7xl px-4 py-12">
          <div className="reveal mb-5 flex items-center justify-between">
            <h2 className="font-heading text-[length:var(--step-h2)] text-hc-navy">
              Productos destacados
            </h2>
            <a
              href="/productos"
              className="text-sm font-medium text-hc-blue transition-colors hover:text-hc-steel"
            >
              Ver todo →
            </a>
          </div>
          <div className="reveal grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        <BrandsSection />
        <QuoteCTA />

        {/* SEO (izq) + FAQs (der) en dos columnas para acortar la página */}
        <section className="mx-auto max-w-7xl px-4 py-14">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <SeoBlock />
            <div className="reveal">
              <h2 className="mb-4 font-heading text-[length:var(--step-h2)] text-hc-navy">
                Preguntas frecuentes
              </h2>
              <FaqAccordion faqs={HOME_FAQS} />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
