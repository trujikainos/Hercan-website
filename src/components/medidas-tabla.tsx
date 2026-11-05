import Link from "next/link";
import type { Product } from "@/lib/types";
import type { MedidasContent } from "@/lib/taxonomy-content";
import { isoFamilyMatch, searchProductsLocal } from "@/lib/catalog";

type Fila = MedidasContent["filas"][number];

/**
 * Tabla de medidas de un nodo de tienda (/tipo, /instrumento, /categoria). Cada fila
 * puede enlazar a los modelos del catálogo REAL de esa medida, y el número que
 * muestra es SIEMPRE el mismo que verá el usuario al dar clic:
 * - `iso`: cuenta con la familia ISO y enlaza a /iso/<código> (insertos).
 * - `buscar`: cuenta con la misma búsqueda del sitio que abre el enlace.
 * - `patron` (regex sobre el título): solo control en desarrollo; si la búsqueda trae
 *   algo distinto a lo que dice la fila (p. ej. "6mm" también encuentra "16mm"), se
 *   avisa en consola para corregir la fila antes de publicar.
 * Sin modelos, la fila manda a cotización ("Sobre pedido").
 */
export function MedidasTabla({ medidas, productos }: { medidas: MedidasContent; productos: Product[] }) {
  const conConteo = medidas.filas.some((f) => f.patron || f.buscar || f.iso);

  const destino = (f: Fila): { n: number; href: string } | null => {
    if (f.iso) {
      return {
        n: productos.filter((p) => isoFamilyMatch(p.iso, f.iso!)).length,
        href: `/iso/${f.iso.toLowerCase()}`,
      };
    }
    if (f.buscar) {
      const n = searchProductsLocal(productos, f.buscar, { frase: f.frase }).length;
      if (process.env.NODE_ENV !== "production" && f.patron) {
        const re = new RegExp(f.patron, "i");
        const porTitulo = productos.filter((p) => re.test(p.title)).length;
        if (porTitulo !== n) {
          console.warn(
            `[MedidasTabla] "${medidas.titulo}" · ${f.celdas[0]}: la búsqueda "${f.buscar}" trae ${n} y el título dice ${porTitulo}`,
          );
        }
      }
      return { n, href: `/buscar?q=${encodeURIComponent(f.buscar)}${f.frase ? "&frase=1" : ""}` };
    }
    return null;
  };

  return (
    <section className="border-t border-hc-metal-light">
      <div className="reveal mx-auto max-w-5xl px-4 py-12">
        <h2 className="font-heading text-[length:var(--step-h2)] text-hc-navy">{medidas.titulo}</h2>
        <p className="mt-2 text-sm leading-relaxed text-hc-gunmetal">{medidas.intro}</p>
        <div className="mt-5 overflow-x-auto rounded-xl border border-hc-metal-light bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-hc-soft text-xs uppercase tracking-wide text-hc-gunmetal">
              <tr>
                {medidas.columnas.map((c) => (
                  <th key={c} scope="col" className="px-4 py-2.5">
                    {c}
                  </th>
                ))}
                {conConteo && (
                  <th scope="col" className="px-4 py-2.5">
                    En catálogo
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-hc-metal-light">
              {medidas.filas.map((f) => {
                const d = destino(f);
                return (
                  <tr key={f.celdas[0]}>
                    {f.celdas.map((c, i) => (
                      <td
                        key={i}
                        className={`px-4 py-2 ${i === 0 ? "whitespace-nowrap font-semibold text-hc-navy" : "text-hc-ink"}`}
                      >
                        {c}
                      </td>
                    ))}
                    {conConteo && (
                      <td className="whitespace-nowrap px-4 py-2">
                        {d && d.n > 0 ? (
                          <Link
                            href={d.href}
                            className="font-medium text-hc-blue hover:text-hc-steel hover:underline"
                          >
                            {d.n} {d.n === 1 ? "modelo" : "modelos"} →
                          </Link>
                        ) : (
                          <Link href="/cotizacion" className="text-hc-gunmetal hover:text-hc-blue hover:underline">
                            Sobre pedido
                          </Link>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {medidas.pie && (
          <p className="mt-3 text-sm">
            <Link href={medidas.pie.href} className="font-medium text-hc-blue hover:text-hc-steel hover:underline">
              {medidas.pie.texto} →
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
