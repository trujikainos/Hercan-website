import type { Metadata } from "next";
import { TaxonomyHero, TaxonomyHubGrid } from "@/components/taxonomy";
import { JsonLd } from "@/components/json-ld";
import { pageGraph, breadcrumbNode } from "@/lib/schema";
import { RECUBRIMIENTO_CONTENT } from "@/lib/taxonomy-content";
import { HUB_IMAGES } from "@/lib/hub-images";

// Hub/archivo de la taxonomía RECUBRIMIENTO (TiAlN, TiN, TiCN, AlCrN…).
// Enlaza a cada /recubrimiento/[slug]. Silo por tratamiento de superficie.
export const metadata: Metadata = {
  title: { absolute: "Herramienta por recubrimiento: TiAlN, TiN, TiCN, AlCrN | HERCAN" },
  description:
    "Catálogo por recubrimiento en HERCAN: TiAlN, TiN, TiCN y AlCrN. El recubrimiento define resistencia al calor y vida útil según el material a maquinar. Herramental CNC B2B en México.",
  alternates: { canonical: "/recubrimientos" },
};

export default function RecubrimientosHubPage() {
  const items = Object.entries(RECUBRIMIENTO_CONTENT).map(([slug, c]) => ({
    slug,
    title: c.title,
    blurb: c.intro[0],
    image: HUB_IMAGES.recubrimiento[slug],
  }));

  return (
    <>
      <JsonLd
        data={pageGraph(
          breadcrumbNode([{ name: "Inicio", path: "/" }, { name: "Recubrimientos" }]),
        )}
      />
      <main id="contenido" className="flex-1">
        <TaxonomyHero
          breadcrumb={[{ name: "Inicio", href: "/" }, { name: "Recubrimientos" }]}
          title="Herramienta por recubrimiento"
          intro={[
            "El recubrimiento es la capa que protege el filo: aumenta la dureza superficial, reduce la fricción y disipa el calor. El adecuado depende del material a maquinar y de la velocidad de corte.",
            "Explora el herramental de HERCAN por recubrimiento —TiAlN, TiN, TiCN, AlCrN— y dentro afina por marca, tipo de herramienta y material a maquinar.",
          ]}
        />
        <TaxonomyHubGrid items={items} hrefBase="/recubrimiento" />
      </main>
    </>
  );
}
