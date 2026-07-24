import type { Metadata } from "next";
import Link from "next/link";
import { TaxonomyHero } from "@/components/taxonomy";
import { JsonLd } from "@/components/json-ld";
import { pageGraph, breadcrumbNode } from "@/lib/schema";
import { CATEGORY_CONTENT } from "@/lib/taxonomy-content";

// Hub/archivo de la taxonomía CATEGORÍAS: lista las categorías de operación y enlaza
// a cada /categoria/[slug]. Estructura de silos → autoridad temática + rastreo.
export const metadata: Metadata = {
  title: { absolute: "Categorías de herramental y equipos de medición | HERCAN" },
  description:
    "Catálogo por categoría en HERCAN: fresado, torneado, perforación, roscado, medición y más. Herramientas de corte y metrología con cotización B2B en México.",
  alternates: { canonical: "/categorias" },
};

export default function CategoriasHubPage() {
  const cats = Object.entries(CATEGORY_CONTENT).map(([slug, c]) => ({ slug, ...c }));

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
        <section className="mx-auto max-w-7xl px-4 py-10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cats.map((c) => (
              <Link
                key={c.slug}
                href={`/categoria/${c.slug}`}
                className="group flex flex-col gap-2 rounded-xl border border-hc-metal-light bg-white p-6 transition hover:border-hc-blue hover:shadow-sm"
              >
                <span className="font-heading text-lg text-hc-navy group-hover:text-hc-blue">
                  {c.title}
                </span>
                <span className="line-clamp-2 text-sm text-hc-gunmetal">{c.intro[0]}</span>
                <span className="mt-1 text-sm font-medium text-hc-blue group-hover:text-hc-steel">
                  Ver catálogo →
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
