import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TaxonomyHero } from "@/components/taxonomy";
import { JsonLd } from "@/components/json-ld";
import { pageGraph, breadcrumbNode } from "@/lib/schema";
import { indexBrands, partNumberRows } from "@/lib/part-number-index";

// Índice de números de parte de UNA marca: tabla N° de parte → ficha.
// Marcas fijas (site.brands + "Otras marcas"); los productos salen de Shopify.
// Render por petición, NO en el build: cada página carga el catálogo completo y,
// prerenderizadas junto con las 3,166 fichas, el build de Vercel se quedó sin
// memoria (OOM, 2026-11-04). Las lecturas de Shopify siguen en la caché de datos.
export const dynamic = "force-dynamic";

const brandOf = (slug: string) => indexBrands().find((b) => b.slug === slug) ?? null;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ marca: string }>;
}): Promise<Metadata> {
  const { marca } = await params;
  const b = brandOf(marca);
  if (!b) return {};
  const otras = marca === "otras-marcas";
  return {
    title: {
      absolute: otras
        ? "Números de parte de otras marcas | HERCAN"
        : `Números de parte ${b.name}: índice de productos | HERCAN`,
    },
    description: otras
      ? "Índice de números de parte de boquillas, machuelos, brocas y más herramental de otras marcas en HERCAN. Busca el código y ve precio y existencia."
      : `Todos los números de parte ${b.name} que vende HERCAN en México. Busca el código exacto y ve precio con IVA, existencia y especificaciones.`,
    alternates: { canonical: `/numeros-de-parte/${marca}` },
  };
}

export default async function NumerosDeParteMarca({
  params,
}: {
  params: Promise<{ marca: string }>;
}) {
  const { marca } = await params;
  const b = brandOf(marca);
  if (!b) notFound();
  const rows = await partNumberRows(marca).catch(() => []);
  const conCodigo = rows.some((r) => r.code);
  const titulo = marca === "otras-marcas" ? "Números de parte de otras marcas" : `Números de parte ${b.name}`;

  return (
    <>
      <JsonLd
        data={pageGraph(
          breadcrumbNode([
            { name: "Inicio", path: "/" },
            { name: "Números de parte", path: "/numeros-de-parte" },
            { name: b.name },
          ]),
        )}
      />
      <main id="contenido" className="flex-1">
        <TaxonomyHero
          breadcrumb={[
            { name: "Inicio", href: "/" },
            { name: "Números de parte", href: "/numeros-de-parte" },
            { name: b.name },
          ]}
          title={titulo}
          intro={[
            `${rows.length.toLocaleString("es-MX")} productos ordenados por número de parte del fabricante${
              conCodigo ? ", con el código de catálogo de Iscar al lado" : ""
            }. Busca tu código con Ctrl+F y abre la ficha para ver precio, existencia y especificaciones.`,
          ]}
        />
        <section className="mx-auto max-w-5xl px-4 py-8">
          {rows.length === 0 ? (
            <p className="text-hc-gunmetal">Por ahora no hay productos de esta marca en línea.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-hc-metal-light bg-white">
              {/* Estilos a nivel tabla (no por celda): con 800+ filas, repetir clases en
                  cada <td> inflaba el HTML varias veces. Enlaces con <a> plano: son
                  cientos y no necesitan prefetch del router. */}
              <table className="w-full text-left text-sm [&_a:hover]:text-hc-blue [&_tbody_tr:hover]:bg-hc-soft/50 [&_td]:px-4 [&_td]:py-2 [&_td.c]:whitespace-nowrap [&_td.c]:font-mono [&_td.c_a]:font-semibold [&_td.c_a]:text-hc-navy [&_td.k]:whitespace-nowrap [&_td.k]:font-mono [&_td.k]:text-hc-gunmetal [&_th]:px-4 [&_th]:py-2.5">
                <thead className="bg-hc-soft text-xs uppercase tracking-wide text-hc-gunmetal">
                  <tr>
                    <th scope="col">N° de parte</th>
                    {conCodigo && <th scope="col">Código Iscar</th>}
                    <th scope="col">Producto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hc-metal-light">
                  {rows.map((r) => (
                    <tr key={r.handle}>
                      <td className="c">
                        <a href={`/producto/${r.handle}`}>{r.partNumber}</a>
                      </td>
                      {conCodigo && <td className="k">{r.code ?? ""}</td>}
                      <td>
                        <a href={`/producto/${r.handle}`}>{r.name}</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
