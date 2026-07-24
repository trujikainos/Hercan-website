import type { Metadata } from "next";
import { TaxonomyHero, TaxonomyHubGrid } from "@/components/taxonomy";
import { JsonLd } from "@/components/json-ld";
import { pageGraph, breadcrumbNode } from "@/lib/schema";
import { PARA_CONTENT } from "@/lib/taxonomy-content";
import { HUB_IMAGES } from "@/lib/hub-images";

// Hub/archivo de la MINA DE ORO: herramienta por MATERIAL A MAQUINAR (ISO 513).
// El ingeniero llega buscando "herramienta para acero inoxidable" → aterriza aquí
// → entra al grupo P/M/K/N/S/H. Enlaza a cada /para/[slug].
export const metadata: Metadata = {
  title: { absolute: "Herramienta por material a maquinar (ISO 513) | HERCAN" },
  description:
    "Encuentra la herramienta de corte por el material que vas a maquinar: acero (P), inoxidable (M), fundición (K), aluminio/no ferrosos (N), superaleaciones (S) y endurecidos (H). Clasificación ISO 513 en HERCAN.",
  alternates: { canonical: "/para" },
};

export default function ParaHubPage() {
  const items = Object.entries(PARA_CONTENT).map(([slug, c]) => ({
    slug,
    title: c.title,
    blurb: c.intro[0],
    image: HUB_IMAGES.para[slug],
  }));

  return (
    <>
      <JsonLd
        data={pageGraph(
          breadcrumbNode([{ name: "Inicio", path: "/" }, { name: "Por material a maquinar" }]),
        )}
      />
      <main id="contenido" className="flex-1">
        <TaxonomyHero
          breadcrumb={[{ name: "Inicio", href: "/" }, { name: "Por material a maquinar" }]}
          title="Herramienta por material a maquinar"
          intro={[
            "La forma más rápida de elegir bien: parte del material que vas a maquinar. La norma ISO 513 agrupa los materiales de la pieza en seis grupos por color —P (acero), M (inoxidable), K (fundición), N (aluminio y no ferrosos), S (superaleaciones y titanio) y H (materiales endurecidos)— y cada grupo pide una geometría, un grado y un recubrimiento distintos.",
            "Elige tu grupo y HERCAN te muestra la herramienta de corte adecuada para ese material. Dentro puedes afinar por operación, marca y recubrimiento.",
          ]}
        />
        <TaxonomyHubGrid items={items} hrefBase="/para" cta="Ver herramienta" />
      </main>
    </>
  );
}
