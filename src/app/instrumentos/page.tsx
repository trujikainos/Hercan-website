import type { Metadata } from "next";
import { TaxonomyHero, TaxonomyHubGrid } from "@/components/taxonomy";
import { JsonLd } from "@/components/json-ld";
import { pageGraph, breadcrumbNode } from "@/lib/schema";
import { INSTRUMENTO_CONTENT } from "@/lib/taxonomy-content";
import { HUB_IMAGES } from "@/lib/hub-images";

// Hub/archivo de la familia MEDICIÓN (silo paralelo a /tipos). Enlaza a cada
// /instrumento/[slug]. Separa medición del herramental de corte (decisión de
// arquitectura: hub propio, no mezclar en /tipos).
export const metadata: Metadata = {
  title: { absolute: "Instrumentos de medición y metrología | HERCAN" },
  description:
    "Equipos de medición en HERCAN: micrómetros, calibradores vernier (pie de rey) e indicadores de carátula de marcas como Insize y Mitutoyo. Cotización B2B y B2C en México.",
  alternates: { canonical: "/instrumentos" },
};

export default function InstrumentosHubPage() {
  const items = Object.entries(INSTRUMENTO_CONTENT).map(([slug, c]) => ({
    slug,
    title: c.title,
    blurb: c.intro[0],
    image: HUB_IMAGES.instrumento[slug],
  }));

  return (
    <>
      <JsonLd
        data={pageGraph(
          breadcrumbNode([{ name: "Inicio", path: "/" }, { name: "Instrumentos de medición" }]),
        )}
      />
      <main id="contenido" className="flex-1">
        <TaxonomyHero
          breadcrumb={[{ name: "Inicio", href: "/" }, { name: "Instrumentos de medición" }]}
          title="Instrumentos de medición"
          intro={[
            "Explora la metrología de HERCAN por tipo de instrumento: micrómetros, calibradores vernier (pie de rey) e indicadores de carátula, de marcas como Insize y Mitutoyo.",
            "Mostramos los modelos en existencia; lo que no esté en stock lo conseguimos sobre pedido — solicita tu cotización en línea.",
          ]}
        />
        <TaxonomyHubGrid items={items} hrefBase="/instrumento" />
      </main>
    </>
  );
}
