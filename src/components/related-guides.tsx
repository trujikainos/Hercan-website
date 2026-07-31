import Link from "next/link";
import { FileText, ArrowRight } from "lucide-react";
import { relatedGuides } from "@/lib/blog-links";

// Bloque "Guía relacionada" para las páginas de nodo de taxonomía. Enlaza el nodo
// de tienda con su(s) guía(s) de blog (enlazado recíproco). No renderiza nada si
// el nodo no tiene guía mapeada.
export function RelatedGuides({
  ns,
  slug,
}: {
  ns: "tipo" | "instrumento" | "categoria";
  slug: string;
}) {
  const items = relatedGuides(ns, slug);
  if (items.length === 0) return null;

  return (
    <section className="border-t border-hc-metal-light bg-white">
      <div className="reveal mx-auto max-w-5xl px-4 py-12">
        <p className="font-heading text-sm font-semibold uppercase tracking-wide text-hc-steel">
          {items.length > 1 ? "Guías relacionadas" : "Guía relacionada"}
        </p>
        <h2 className="mt-1 font-heading text-[length:var(--step-h2)] text-hc-navy">
          Antes de comprar, lee la guía técnica
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((g) => (
            <Link
              key={g.href}
              href={g.href}
              className="card-hover group flex flex-col rounded-xl border border-hc-metal-light bg-white p-5"
            >
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-hc-steel">
                <FileText className="h-3.5 w-3.5" aria-hidden />
                Guía técnica
              </span>
              <span className="mt-2 font-heading text-base leading-snug text-hc-ink transition-colors group-hover:text-hc-blue">
                {g.title}
              </span>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-hc-blue">
                Leer la guía
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
