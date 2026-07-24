import type { Metadata } from "next";
import { TaxonomyHero, TaxonomyHubGrid } from "@/components/taxonomy";
import { JsonLd } from "@/components/json-ld";
import { pageGraph, breadcrumbNode } from "@/lib/schema";
import { CATEGORY_CONTENT } from "@/lib/taxonomy-content";
import { HUB_IMAGES } from "@/lib/hub-images";

// Hub/archivo de la taxonomía CATEGORÍAS: lista las categorías de operación y enlaza
// a cada /categoria/[slug]. Estructura de silos → autoridad temática + rastreo.
export const metadata: Metadata = {
  title: { absolute: "Categorías de herramental y equipos de medición | HERCAN" },
  description:
    "Catálogo por categoría en HERCAN: fresado, torneado, perforación, roscado, medición y más. Herramientas de corte y metrología con cotización B2B en México.",
  alternates: { canonical: "/categorias" },
};

export default function CategoriasHubPage() {
  const items = Object.entries(CATEGORY_CONTENT).map(([slug, c]) => ({
    slug,
    title: c.title,
    blurb: c.intro[0],
    image: HUB_IMAGES.categoria[slug],
  }));

  return (
    <>
      <JsonLd
        data={pageGraph(
          breadcrumbNode([{ name: "Inicio", path: "/" }, { name: "Categorías" }]),
        )}
      />
      <main id="contenido" className="flex-1">
        <TaxonomyHero
          breadcrumb={[{ name: "Inicio", href: "/" }, { name: "Categorías" }]}
          title="Categorías de herramental y medición"
          intro={[
            "Explora el catálogo de HERCAN por operación de maquinado: fresado, torneado, perforación, roscado, ranurado, portaherramientas, abrasivos, medición y accesorios.",
            "Cada categoría reúne la herramienta adecuada para esa operación; dentro puedes filtrar por marca, material y recubrimiento para dar con la geometría exacta.",
          ]}
        />
        <TaxonomyHubGrid items={items} hrefBase="/categoria" />
      </main>
    </>
  );
}
