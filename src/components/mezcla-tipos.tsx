import Link from "next/link";
import type { Product } from "@/lib/types";
import { TIPO_CONTENT, INSTRUMENTO_CONTENT } from "@/lib/taxonomy-content";

/**
 * "Qué hay aquí, por tipo": en una categoría o marca, cuántos modelos del catálogo
 * REAL hay de cada tipo de herramienta, con enlace a la página de ese tipo filtrada
 * por la misma categoría o marca. El conteo usa el mismo predicado que la página de
 * destino (familia, tipo_herramienta o tipo de instrumento), así el número coincide
 * con lo que se ve al dar clic. Un producto puede contar en dos tipos (p. ej. un buril
 * de familia "Buril" dentro del tipo "Cortador"), igual que en las páginas de tipo.
 */
type Nodo = { href: string; titulo: string; coincide: (p: Product) => boolean };

const NODOS: Nodo[] = [
  ...Object.entries(TIPO_CONTENT).map(([slug, c]) => ({
    href: `/tipo/${slug}`,
    titulo: c.title,
    coincide: c.familia
      ? (p: Product) => p.familia === c.familia
      : (p: Product) => p.type === c.name,
  })),
  ...Object.entries(INSTRUMENTO_CONTENT).map(([slug, c]) => ({
    href: `/instrumento/${slug}`,
    titulo: c.title,
    coincide: (p: Product) => p.tipoInstrumento === c.name,
  })),
];

export function MezclaTipos({
  productos,
  titulo,
  intro,
  filtro,
}: {
  /** Productos YA acotados a la categoría o marca. */
  productos: Product[];
  titulo: string;
  intro: string;
  /** Faceta con la que se abre cada tipo (`marca=Iscar` o `categoria=torneado`). */
  filtro: { param: "marca" | "categoria"; valor: string };
}) {
  const filas = NODOS.map((n) => ({ ...n, total: productos.filter(n.coincide).length }))
    .filter((n) => n.total > 0)
    .sort((a, b) => b.total - a.total);

  // Con un solo tipo la tabla no aporta (repetiría el listado de abajo).
  if (filas.length < 2) return null;

  const qs = `?${filtro.param}=${encodeURIComponent(filtro.valor)}`;

  return (
    <section className="border-t border-hc-metal-light">
      <div className="reveal mx-auto max-w-5xl px-4 py-12">
        <h2 className="font-heading text-[length:var(--step-h2)] text-hc-navy">{titulo}</h2>
        <p className="mt-2 text-sm leading-relaxed text-hc-gunmetal">{intro}</p>
        <div className="mt-5 overflow-x-auto rounded-xl border border-hc-metal-light bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-hc-soft text-xs uppercase tracking-wide text-hc-gunmetal">
              <tr>
                <th scope="col" className="px-4 py-2.5">
                  Tipo de herramienta
                </th>
                <th scope="col" className="px-4 py-2.5 text-right">
                  Modelos en catálogo
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hc-metal-light">
              {filas.map((f) => (
                <tr key={f.href}>
                  <td className="px-4 py-2">
                    <Link
                      href={`${f.href}${qs}`}
                      className="font-semibold text-hc-blue hover:text-hc-steel hover:underline"
                    >
                      {f.titulo}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right text-hc-ink">{f.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
