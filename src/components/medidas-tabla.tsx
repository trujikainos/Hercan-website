import Link from "next/link";
import type { Product } from "@/lib/types";
import type { MedidasContent } from "@/lib/taxonomy-content";

/**
 * Tabla de medidas de un nodo de tienda (/tipo, /instrumento). Si las filas traen
 * `patron`, se cuenta en el catálogo REAL cuántos modelos hay de esa medida y se
 * enlazan (búsqueda del sitio); sin modelos, la fila manda a cotización. Contenido
 * único frente a la competencia (medida → modelos en existencia) y citable por IA.
 */
export function MedidasTabla({ medidas, productos }: { medidas: MedidasContent; productos: Product[] }) {
  const conConteo = medidas.filas.some((f) => f.patron);
  const conteo = (patron?: string) => {
    if (!patron) return 0;
    const re = new RegExp(patron, "i");
    return productos.filter((p) => re.test(p.title)).length;
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
                const n = conteo(f.patron);
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
                        {n > 0 && f.buscar ? (
                          <Link
                            href={`/buscar?q=${encodeURIComponent(f.buscar)}`}
                            className="font-medium text-hc-blue hover:text-hc-steel hover:underline"
                          >
                            {n} {n === 1 ? "modelo" : "modelos"} →
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
