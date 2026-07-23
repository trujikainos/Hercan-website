import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";

/** Item de breadcrumb: sin `href` → texto (página actual). */
export type Crumb = { name: string; href?: string };

/** Ruta de migas visible (el JSON-LD BreadcrumbList se emite aparte, en la página). */
export function TaxonomyBreadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav
      aria-label="Ruta de navegación"
      className="mb-3 flex flex-wrap items-center gap-1 text-sm text-hc-gunmetal"
    >
      {items.map((it, i) => (
        <span key={it.name} className="flex items-center gap-1">
          {i > 0 && (
            <ChevronRight className="h-3.5 w-3.5 text-hc-metal" aria-hidden />
          )}
          {it.href ? (
            <Link href={it.href} className="transition-colors hover:text-hc-blue">
              {it.name}
            </Link>
          ) : (
            <span className="text-hc-ink">{it.name}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

/**
 * Hero informativo de una página de taxonomía: breadcrumb + título + intro
 * citable (AEO/GEO) + bullets opcionales. Mismo lenguaje visual que el
 * encabezado de /productos (banda `hc-soft`, tipografía `hc-*`).
 */
export function TaxonomyHero({
  breadcrumb,
  title,
  intro,
  bullets,
}: {
  breadcrumb: Crumb[];
  title: string;
  intro: string[];
  bullets?: { heading: string; items: string[] }[];
}) {
  return (
    <section className="border-b border-hc-metal-light bg-hc-soft">
      <div className="reveal mx-auto max-w-7xl px-4 py-8">
        <TaxonomyBreadcrumb items={breadcrumb} />
        <h1 className="font-heading text-[length:var(--step-h2)] text-hc-navy">
          {title}
        </h1>
        {/* Info a ancho completo (columna del layout, sin max-w interno): el intro
            fluye en 2 columnas en escritorio para ser más ancho y menos alto. */}
        <div className="mt-4 text-sm leading-relaxed text-hc-gunmetal md:columns-2 md:gap-10">
          {intro.map((p, i) => (
            <p key={i} className="mb-3 break-inside-avoid last:mb-0">
              {p}
            </p>
          ))}
        </div>

        {bullets && bullets.length > 0 && (
          <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:flex-wrap">
            {bullets.map((b) => (
              <div key={b.heading} className="sm:flex-1 sm:min-w-[220px]">
                <h2 className="mb-2 font-heading text-[11px] font-semibold uppercase tracking-wide text-hc-gunmetal">
                  {b.heading}
                </h2>
                <ul className="space-y-1 text-sm text-hc-ink">
                  {b.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Franja de interlinking al pie: enlaces a las taxonomías hermanas (otras marcas
 * / otras categorías) + un CTA a todo el catálogo. Refuerza el SEO interno.
 */
export function SiblingStrip({
  heading,
  items,
  allHref,
  allLabel,
}: {
  heading: string;
  items: Crumb[];
  allHref: string;
  allLabel: string;
}) {
  return (
    <section className="border-t border-hc-metal-light bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <h2 className="mb-4 font-heading text-[length:var(--step-h2)] text-hc-navy">
          {heading}
        </h2>
        <div className="flex flex-wrap gap-2">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href ?? allHref}
              className="press inline-flex items-center rounded-lg border border-hc-metal-light bg-hc-soft/40 px-3.5 py-2 text-sm font-medium text-hc-navy transition-colors hover:border-hc-steel hover:text-hc-blue"
            >
              {it.name}
            </Link>
          ))}
          <Link
            href={allHref}
            className="press inline-flex items-center gap-1 rounded-lg border border-hc-blue px-3.5 py-2 text-sm font-medium text-hc-blue transition-colors hover:bg-hc-soft"
          >
            {allLabel}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
