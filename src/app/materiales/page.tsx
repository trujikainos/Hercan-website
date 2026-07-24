import type { Metadata } from "next";
import { TaxonomyHero, TaxonomyHubGrid } from "@/components/taxonomy";
import { JsonLd } from "@/components/json-ld";
import { pageGraph, breadcrumbNode } from "@/lib/schema";
import { MATERIAL_CONTENT } from "@/lib/taxonomy-content";
import { HUB_IMAGES } from "@/lib/hub-images";

// Hub/archivo de la taxonomía MATERIAL DE LA HERRAMIENTA (carburo, HSS, cobalto).
// OJO: es el material del que está HECHA la herramienta, no el de la pieza (eso es /para).
export const metadata: Metadata = {
  title: { absolute: "Herramienta por material: carburo, HSS y cobalto | HERCAN" },
  description:
    "Catálogo por material de la herramienta en HERCAN: carburo de tungsteno, acero rápido (HSS) y cobalto. Elige la base según dureza, tenacidad y velocidad de corte. B2B en México.",
  alternates: { canonical: "/materiales" },
};

export default function MaterialesHubPage() {
  const items = Object.entries(MATERIAL_CONTENT).map(([slug, c]) => ({
    slug,
    title: c.title,
    blurb: c.intro[0],
    image: HUB_IMAGES.material[slug],
  }));

  return (
    <>
      <JsonLd
        data={pageGraph(
          breadcrumbNode([{ name: "Inicio", path: "/" }, { name: "Material de la herramienta" }]),
        )}
      />
      <main id="contenido" className="flex-1">
        <TaxonomyHero
          breadcrumb={[{ name: "Inicio", href: "/" }, { name: "Material de la herramienta" }]}
          title="Herramienta por material de fabricación"
          intro={[
            "El material del que está hecha la herramienta define su equilibrio entre dureza y tenacidad: el carburo de tungsteno soporta más velocidad y calor, el acero rápido (HSS) tolera mejor el impacto y el corte interrumpido, y el cobalto se sitúa en medio.",
            "Elige la base adecuada a tu operación. No confundir con el material a maquinar (el de la pieza): para eso está la sección Por material a maquinar.",
          ]}
        />
        <TaxonomyHubGrid items={items} hrefBase="/material" />
      </main>
    </>
  );
}
