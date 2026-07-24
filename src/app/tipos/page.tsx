import type { Metadata } from "next";
import { TaxonomyHero, TaxonomyHubGrid } from "@/components/taxonomy";
import { JsonLd } from "@/components/json-ld";
import { pageGraph, breadcrumbNode } from "@/lib/schema";
import { TIPO_CONTENT } from "@/lib/taxonomy-content";
import { HUB_IMAGES } from "@/lib/hub-images";

// Hub/archivo de la taxonomía TIPO DE HERRAMIENTA (inserto, fresa, broca, machuelo…).
// Enlaza a cada /tipo/[slug]. Silo por objeto físico de la herramienta.
export const metadata: Metadata = {
  title: { absolute: "Tipos de herramienta de corte | HERCAN" },
  description:
    "Catálogo por tipo de herramienta en HERCAN: insertos, fresas y endmills, brocas, machuelos, escariadores, barras de mandrinar y portaherramientas. Herramental CNC con cotización B2B en México.",
  alternates: { canonical: "/tipos" },
};

export default function TiposHubPage() {
  const items = Object.entries(TIPO_CONTENT).map(([slug, c]) => ({
    slug,
    title: c.title,
    blurb: c.intro[0],
    image: HUB_IMAGES.tipo[slug],
  }));

  return (
    <>
      <JsonLd
        data={pageGraph(
          breadcrumbNode([{ name: "Inicio", path: "/" }, { name: "Tipos de herramienta" }]),
        )}
      />
      <main id="contenido" className="flex-1">
        <TaxonomyHero
          breadcrumb={[{ name: "Inicio", href: "/" }, { name: "Tipos de herramienta" }]}
          title="Tipos de herramienta de corte"
          intro={[
            "Explora el herramental de HERCAN por tipo de herramienta: insertos intercambiables, fresas y endmills, brocas, machuelos, escariadores, barras de mandrinar y portaherramientas.",
            "Cada tipo agrupa la herramienta por su forma y función; dentro puedes filtrar por marca, material a maquinar, material de la herramienta y recubrimiento.",
          ]}
        />
        <TaxonomyHubGrid items={items} hrefBase="/tipo" />
      </main>
    </>
  );
}
