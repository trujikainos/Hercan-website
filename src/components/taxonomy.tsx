import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";

/** Item de breadcrumb: sin `href` → texto (página actual). */
export type Crumb = { name: string; href?: string };

/** Ruta de migas visible (el JSON-LD BreadcrumbList se emite aparte, en la página).
 *  `variant="dark"` para hero con imagen de fondo (texto claro sobre navy). */
export function TaxonomyBreadcrumb({
  items,
  variant = "light",
}: {
  items: Crumb[];
  variant?: "light" | "dark";
}) {
  const dark = variant === "dark";
  return (
    <nav
      aria-label="Ruta de navegación"
      className={`mb-3 flex flex-wrap items-center gap-1 text-sm ${
        dark ? "text-white/70" : "text-hc-gunmetal"
      }`}
    >
      {items.map((it, i) => (
        <span key={it.name} className="flex items-center gap-1">
          {i > 0 && (
            <ChevronRight
              className={`h-3.5 w-3.5 ${dark ? "text-white/40" : "text-hc-metal"}`}
              aria-hidden
            />
          )}
          {it.href ? (
            <Link
              href={it.href}
              className={`transition-colors ${dark ? "hover:text-white" : "hover:text-hc-blue"}`}
            >
              {it.name}
            </Link>
          ) : (
            <span className={dark ? "text-white" : "text-hc-ink"}>{it.name}</span>
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
  image,
}: {
  breadcrumb: Crumb[];
  title: string;
  intro: string[];
  bullets?: { heading: string; items: string[] }[];
  /** Portada opcional (Higgsfield). Cuando existe, flota a la derecha en desktop
   *  y el intro pasa a una sola columna. Sin imagen → layout previo intacto. */
  image?: { src: string; alt: string };
}) {
  // CON imagen → hero inmersivo: foto de fondo + overlay navy + texto blanco (mismo
  // lenguaje que el hero de la home). SIN imagen → banda clara `hc-soft` (fallback).
  if (image) {
    return (
      <section className="relative overflow-hidden border-b border-hc-metal-light bg-hc-navy text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.src}
          alt={image.alt}
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
        {/* Overlays de marca: aseguran contraste del texto sobre la foto. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-hc-navy via-hc-navy/85 to-hc-navy/40"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-hc-navy/80 via-transparent to-transparent"
        />
        <div className="reveal relative z-10 mx-auto max-w-7xl px-4 py-6 sm:py-8">
          <TaxonomyBreadcrumb items={breadcrumb} variant="dark" />
          <h1 className="max-w-3xl font-heading font-semibold leading-tight text-[length:var(--step-h2)]">
            {title}
          </h1>
          <div className="mt-2 max-w-3xl space-y-1.5 text-sm leading-snug text-hc-sky">
            {intro.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {bullets && bullets.length > 0 && (
            <div className="mt-4 flex flex-col gap-x-6 gap-y-2 sm:flex-row sm:flex-wrap">
              {bullets.map((b) => (
                <div key={b.heading} className="sm:flex-1 sm:min-w-[220px]">
                  <h2 className="mb-2 font-heading text-[11px] font-semibold uppercase tracking-wide text-white/60">
                    {b.heading}
                  </h2>
                  <ul className="space-y-1 text-sm text-white/90">
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

  return (
    <section className="border-b border-hc-metal-light bg-hc-soft">
      <div className="reveal mx-auto max-w-7xl px-4 py-8">
        <TaxonomyBreadcrumb items={breadcrumb} />
        <h1 className="font-heading text-[length:var(--step-h2)] text-hc-navy">{title}</h1>
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
 * Grid de tarjetas para los HUBS de taxonomía (Categorías, Tipos, Materiales,
 * Recubrimientos, Por material, ISO). Cada tarjeta enlaza a su página individual
 * `{hrefBase}/{slug}`. Soporta portada opcional (Higgsfield): si el item trae
 * `image`, la tarjeta muestra la foto arriba; si no, queda el layout de texto.
 * Fuente única para no repetir el grid en cada hub → todos quedan image-ready.
 */
export function TaxonomyHubGrid({
  items,
  hrefBase,
  cta = "Ver catálogo",
}: {
  items: { slug: string; title: string; blurb: string; image?: string }[];
  hrefBase: string;
  cta?: string;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <Link
            key={it.slug}
            href={`${hrefBase}/${it.slug}`}
            className="group flex flex-col overflow-hidden rounded-xl border border-hc-metal-light bg-white transition hover:border-hc-blue hover:shadow-sm"
          >
            {it.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={it.image}
                alt=""
                className="aspect-[16/9] w-full object-cover"
                loading="lazy"
              />
            )}
            <div className="flex flex-1 flex-col gap-2 p-6">
              <span className="font-heading text-lg text-hc-navy group-hover:text-hc-blue">
                {it.title}
              </span>
              <span className="line-clamp-2 text-sm text-hc-gunmetal">{it.blurb}</span>
              <span className="mt-auto pt-1 text-sm font-medium text-hc-blue group-hover:text-hc-steel">
                {cta} →
              </span>
            </div>
          </Link>
        ))}
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
