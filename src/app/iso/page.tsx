import type { Metadata } from "next";
import { TaxonomyHero, TaxonomyHubGrid } from "@/components/taxonomy";
import { JsonLd } from "@/components/json-ld";
import { pageGraph, breadcrumbNode } from "@/lib/schema";
import { ISO_CONTENT } from "@/lib/taxonomy-content";
import { HUB_IMAGES } from "@/lib/hub-images";

// Hub/archivo de la taxonomía DESIGNACIÓN ISO de inserto (CNMG, TNMG, DNMG…).
// Enlaza a cada /iso/[slug]. Silo por código ISO 1832 de la plaquita.
export const metadata: Metadata = {
  title: { absolute: "Insertos por designación ISO: CNMG, TNMG, DNMG y más | HERCAN" },
  description:
    "Catálogo de insertos por código ISO 1832 en HERCAN: CNMG, TNMG, DNMG, WNMG, SNMG y más. Encuentra la plaquita por forma, ángulo de incidencia y geometría. B2B en México.",
  alternates: { canonical: "/iso" },
};

export default function IsoHubPage() {
  const items = Object.entries(ISO_CONTENT).map(([slug, c]) => ({
    slug,
    title: c.title,
    blurb: c.intro[0],
    image: HUB_IMAGES.iso[slug],
  }));

  return (
    <>
      <JsonLd
        data={pageGraph(
          breadcrumbNode([{ name: "Inicio", path: "/" }, { name: "Designación ISO" }]),
        )}
      />
      <main id="contenido" className="flex-1">
        <TaxonomyHero
          breadcrumb={[{ name: "Inicio", href: "/" }, { name: "Designación ISO" }]}
          title="Insertos por designación ISO"
          intro={[
            "Cada inserto de torneado se identifica con un código ISO 1832: la primera letra da la forma de la plaquita (C rómbica 80°, T triangular, D rómbica 55°, W trigonal…), y las siguientes el ángulo de incidencia, la tolerancia y el tipo de sujeción.",
            "Si ya conoces la designación de tu inserto, entra directo a su familia. Explora las familias ISO de HERCAN y afina por marca, grado y geometría rompevirutas.",
          ]}
        />
        <TaxonomyHubGrid items={items} hrefBase="/iso" cta="Ver insertos" />
      </main>
    </>
  );
}
