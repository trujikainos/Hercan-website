import type { Metadata } from "next";
import Link from "next/link";
import { TaxonomyHero } from "@/components/taxonomy";
import { JsonLd } from "@/components/json-ld";
import { pageGraph, breadcrumbNode } from "@/lib/schema";
import { indexBrands, partNumberCounts } from "@/lib/part-number-index";

// Hub del índice de números de parte: una entrada por marca con su conteo.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: { absolute: "Números de parte de herramientas de corte y medición | HERCAN" },
  description:
    "Índice de números de parte de Iscar, Toolmex, YG-1, Palbit, Mitutoyo, Insize y más. Busca el código exacto y ve precio, existencia y especificaciones en HERCAN.",
  alternates: { canonical: "/numeros-de-parte" },
};

export default async function NumerosDeParteHub() {
  const counts = await partNumberCounts().catch(() => ({}) as Record<string, number>);
  const brands = indexBrands().filter((b) => (counts[b.slug] ?? 0) > 0);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <>
      <JsonLd
        data={pageGraph(
          breadcrumbNode([{ name: "Inicio", path: "/" }, { name: "Números de parte" }]),
        )}
      />
      <main id="contenido" className="flex-1">
        <TaxonomyHero
          breadcrumb={[{ name: "Inicio", href: "/" }, { name: "Números de parte" }]}
          title="Números de parte"
          intro={[
            `Índice de los ${total.toLocaleString("es-MX")} números de parte que vende HERCAN, organizados por marca. Si ya tienes el código del fabricante, aquí lo encuentras directo.`,
            "Entra a la marca, busca el código con Ctrl+F (o Buscar en la página del celular) y abre la ficha para ver precio con IVA, existencia y especificaciones, o para cotizar por volumen.",
          ]}
        />
        <section className="mx-auto max-w-7xl px-4 py-10">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {brands.map((b) => (
              <Link
                key={b.slug}
                href={`/numeros-de-parte/${b.slug}`}
                className="group flex flex-col items-center justify-center gap-1 rounded-xl border border-hc-metal-light bg-white p-6 text-center transition hover:border-hc-blue hover:shadow-sm"
              >
                <span className="font-heading text-lg text-hc-navy">{b.name}</span>
                <span className="text-sm text-hc-gunmetal">
                  {(counts[b.slug] ?? 0).toLocaleString("es-MX")} números de parte
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
