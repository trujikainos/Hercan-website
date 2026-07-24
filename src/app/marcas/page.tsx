import type { Metadata } from "next";
import Link from "next/link";
import { TaxonomyHero } from "@/components/taxonomy";
import { JsonLd } from "@/components/json-ld";
import { pageGraph, breadcrumbNode } from "@/lib/schema";
import { site } from "@/lib/site";
import { brandSlug } from "@/lib/catalog";
import { BRAND_CONTENT } from "@/lib/taxonomy-content";

// Hub/archivo de la taxonomía MARCAS: lista todas las marcas (con logo) y enlaza a
// cada /marca/[slug]. Estructura de silos → concentra autoridad y mejora el rastreo.
export const metadata: Metadata = {
  title: { absolute: "Marcas de herramientas de corte y medición | HERCAN" },
  description:
    "Marcas que distribuye HERCAN en México: Iscar, Toolmex, YG-1, Palbit, Mitutoyo, Insize y más. Herramental de corte y equipos de medición con cotización B2B.",
  alternates: { canonical: "/marcas" },
};

export default function MarcasHubPage() {
  const brands = site.brands.map((b) => {
    const slug = brandSlug(b.name);
    return { name: b.name, logo: b.logo, slug, content: BRAND_CONTENT[slug] };
  });

  return (
    <>
      <JsonLd
        data={pageGraph(
          breadcrumbNode([{ name: "Inicio", path: "/" }, { name: "Marcas" }]),
        )}
      />
      <main id="contenido" className="flex-1">
        <TaxonomyHero
          breadcrumb={[{ name: "Inicio", href: "/" }, { name: "Marcas" }]}
          title="Marcas que distribuimos"
          intro={[
            "En HERCAN distribuimos las principales marcas de herramientas de corte y equipos de medición para la industria metalmecánica en México, con cotización B2B y asesoría técnica.",
            "Explora cada marca para ver su catálogo disponible: insertos, fresas, brocas, machuelos, portaherramientas e instrumentos de medición.",
          ]}
        />
        <section className="mx-auto max-w-7xl px-4 py-10">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {brands.map((b) => (
              <Link
                key={b.slug}
                href={`/marca/${b.slug}`}
                className="group flex flex-col items-center justify-center gap-3 rounded-xl border border-hc-metal-light bg-white p-6 text-center transition hover:border-hc-blue hover:shadow-sm"
              >
                <div className="flex h-12 items-center justify-center">
                  {b.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={b.logo}
                      alt={`Logo ${b.name}`}
                      className="max-h-10 w-auto object-contain"
                    />
                  ) : (
                    <span className="font-heading text-xl text-hc-navy">{b.name}</span>
                  )}
                </div>
                <span className="text-sm font-medium text-hc-blue group-hover:text-hc-steel">
                  {b.content?.title ?? `Ver ${b.name}`} →
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
