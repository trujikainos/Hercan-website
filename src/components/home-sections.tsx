import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Drill,
  CircleDot,
  Bolt,
  Wrench,
  Ruler,
  Headset,
  Boxes,
  Truck,
  FileText,
} from "lucide-react";
import type { Category } from "@/lib/types";
import { site } from "@/lib/site";
import { brandSlug } from "@/lib/catalog";
import { HeroCarousel } from "./hero-carousel";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Drill,
  CircleDot,
  Bolt,
  Wrench,
  Ruler,
};

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-hc-navy text-white">
      <HeroCarousel />
      {/* Overlays de marca: aseguran el contraste del texto blanco sobre las fotos */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-hc-navy via-hc-navy/75 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-hc-navy/70 via-hc-navy/10 to-transparent"
      />
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:py-20">
        <span className="hero-in inline-block rounded-full bg-hc-blue/80 px-3 py-1 text-xs text-hc-metal-light ring-1 ring-white/10">
          B2B industrial · Monterrey y todo México
        </span>
        <h1 className="mt-4 max-w-3xl font-heading font-semibold leading-[1.05] text-[length:var(--step-hero)]">
          Herramientas de corte para CNC y equipos de medición
        </h1>
        <p
          className="hero-in mt-4 max-w-2xl text-hc-sky"
          style={{ animationDelay: "0.12s" }}
        >
          Insertos, fresas, brocas y portaherramientas de carburo de tungsteno.
          Distribuidor de Iscar, Toolmex, YG, Palbit y Mitutoyo en México — con
          especificaciones técnicas filtrables y cotización B2B.
        </p>
        <div
          className="hero-in mt-7 flex flex-wrap gap-3"
          style={{ animationDelay: "0.22s" }}
        >
          <Link
            href="/productos"
            className="press group inline-flex items-center gap-2 rounded-lg bg-hc-steel px-5 py-2.5 font-medium text-white transition-colors hover:bg-hc-blue"
          >
            Ver catálogo
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden
            />
          </Link>
          <Link
            href="/cotizacion"
            data-event="generate_lead"
            className="press inline-flex items-center gap-2 rounded-lg border border-white/25 px-5 py-2.5 font-medium text-white transition-colors hover:bg-white/10"
          >
            <FileText className="h-4 w-4" aria-hidden />
            Solicitar cotización
          </Link>
        </div>
        <p className="mt-5 text-sm text-hc-metal-light/80">
          Carburo de alta precisión · Cotización por volumen · Asesoría técnica
        </p>
      </div>
    </section>
  );
}

export function BrandBar() {
  // Duplicamos las marcas para un carrusel (marquee) infinito sin salto: la 2ª
  // mitad ocupa la posición de la 1ª cuando el track llega a -50%.
  const loop = [...site.brands, ...site.brands];
  return (
    <section className="border-b border-hc-metal-light bg-white py-6">
      <p className="mb-4 text-center text-xs font-semibold uppercase tracking-wide text-hc-gunmetal">
        Marcas que distribuimos
      </p>
      <div className="group relative overflow-hidden">
        {/* Fades a los lados para que los logos aparezcan/desaparezcan suave. */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-white to-transparent sm:w-20" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-white to-transparent sm:w-20" />
        <ul className="marquee-track flex w-max items-center gap-10 sm:gap-14 group-hover:[animation-play-state:paused]">
          {loop.map((b, i) => {
            const dup = i >= site.brands.length;
            return (
              <li key={i} className="shrink-0" aria-hidden={dup || undefined}>
                <Link
                  href={`/marca/${brandSlug(b.name)}`}
                  className="flex items-center font-heading text-lg font-semibold text-hc-steel transition-colors hover:text-hc-blue"
                  aria-label={b.name}
                  tabIndex={dup ? -1 : undefined}
                >
                  {b.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.logo} alt={b.name} className="h-9 w-auto object-contain" />
                  ) : (
                    b.name
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export function ValueProps() {
  const items = [
    {
      icon: Headset,
      title: "Asesoría técnica",
      text: "Te ayudamos a elegir la herramienta correcta por material y operación.",
    },
    {
      icon: FileText,
      title: "Cotización por volumen",
      text: "Precios B2B para talleres, plantas e integradores.",
    },
    {
      icon: Boxes,
      title: "Existencias y sobre pedido",
      text: "Inventario disponible e importación directa de fábrica.",
    },
    {
      icon: Truck,
      title: "Envíos a todo México",
      text: "Directo a tu taller o planta, desde Monterrey.",
    },
  ];
  return (
    <section className="bg-hc-soft">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it, i) => (
          <div
            key={it.title}
            className="reveal flex items-start gap-3"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-hc-steel ring-1 ring-hc-metal-light">
              <it.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="font-medium text-hc-navy">{it.title}</p>
              <p className="mt-0.5 text-sm text-hc-gunmetal">{it.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <h2 className="reveal mb-5 font-heading text-[length:var(--step-h2)] text-hc-navy">
        Explora por categoría
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {categories.map((c, i) => {
          const Icon = ICONS[c.icon] ?? Drill;
          return (
            <Link
              key={c.slug}
              href={`/categoria/${c.slug}`}
              className="reveal card-hover press group flex flex-col items-center gap-2 rounded-xl border border-hc-metal-light bg-white p-5 text-center hover:border-hc-steel"
              style={{ animationDelay: `${Math.min(i * 55, 300)}ms` }}
            >
              <Icon className="h-6 w-6 text-hc-steel transition-transform duration-300 group-hover:scale-110" />
              <span className="text-sm font-medium text-hc-navy">{c.name}</span>
              {c.count != null && (
                <span className="text-xs text-hc-gunmetal">{c.count} productos</span>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function BrandsSection() {
  const blurbs: Record<string, string> = {
    Iscar: "Insertos, fresas y portaherramientas de la marca líder mundial en corte de metal.",
    Toolmex: "Herramienta de corte HSS y de carburo para torno, fresa y taladro.",
    YG: "Fresas y brocas de carburo de alto rendimiento (YG-1).",
    Palbit: "Insertos y herramienta de corte de carburo de origen europeo.",
    Mitutoyo: "Equipos de medición de precisión: calibradores, micrómetros e indicadores.",
  };
  return (
    <section className="border-y border-hc-metal-light bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="reveal mb-5 font-heading text-[length:var(--step-h2)] text-hc-navy">
          Marcas que distribuimos en México
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {site.brands.map((b, i) => (
            <Link
              key={b.name}
              href={`/marca/${brandSlug(b.name)}`}
              className="reveal card-hover group flex items-center justify-between gap-4 rounded-xl border border-hc-metal-light bg-hc-soft/40 p-5 hover:border-hc-steel"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div>
                {b.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.logo} alt={b.name} className="h-8 w-auto object-contain" />
                ) : (
                  <p className="font-heading text-lg font-semibold text-hc-navy">{b.name}</p>
                )}
                <p className="mt-1 text-sm text-hc-gunmetal">
                  {blurbs[b.name] ?? "Herramental industrial de calidad."}
                </p>
              </div>
              <ArrowRight
                className="h-5 w-5 shrink-0 text-hc-steel transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function QuoteCTA() {
  return (
    <section className="bg-hc-navy text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-5 px-4 py-12 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-2xl">¿Necesitas precios por volumen?</h2>
          <p className="mt-1 max-w-xl text-hc-sky">
            Solicita tu cotización B2B y recibe asesoría técnica para elegir la
            herramienta correcta. Respuesta rápida para talleres, plantas e
            integradores.
          </p>
        </div>
        <Link
          href="/cotizacion"
          data-event="generate_lead"
          className="press inline-flex shrink-0 items-center gap-2 rounded-lg bg-hc-steel px-5 py-3 font-medium text-white transition-colors hover:bg-hc-blue"
        >
          <FileText className="h-4 w-4" aria-hidden />
          Solicitar cotización
        </Link>
      </div>
    </section>
  );
}

export function SeoBlock() {
  return (
    <div className="reveal text-sm leading-relaxed text-hc-gunmetal">
      <h2 className="mb-3 font-heading text-[length:var(--step-h2)] text-hc-navy">
        Herramental para CNC y metrología, con asesoría B2B
      </h2>
      <p>
          En <strong className="text-hc-ink">HERCAN</strong> encuentras{" "}
          <Link href="/categoria/fresado" className="text-hc-blue hover:underline">
            fresas de carburo
          </Link>
          ,{" "}
          <Link href="/categoria/torneado" className="text-hc-blue hover:underline">
            insertos de torneado
          </Link>
          ,{" "}
          <Link href="/categoria/perforacion" className="text-hc-blue hover:underline">
            brocas para CNC
          </Link>
          ,{" "}
          <Link href="/categoria/roscado" className="text-hc-blue hover:underline">
            machuelos y herramienta de roscado
          </Link>{" "}
          y{" "}
          <Link href="/categoria/portaherramientas" className="text-hc-blue hover:underline">
            portaherramientas
          </Link>{" "}
          de carburo de tungsteno de las marcas líderes. También manejamos{" "}
          <Link href="/categoria/medicion" className="text-hc-blue hover:underline">
            equipos de medición Mitutoyo
          </Link>{" "}
          (calibradores, micrómetros e indicadores) para control dimensional.
        </p>
        <p className="mt-3">
          Somos distribuidor de herramientas de corte en Monterrey, Nuevo León, con
          envíos a todo México. Compra en línea con especificaciones técnicas
          filtrables por diámetro, número de filos, recubrimiento y designación ISO,
          o{" "}
          <Link href="/cotizacion" className="text-hc-blue hover:underline">
            solicita una cotización B2B
          </Link>{" "}
          para precios por volumen y asesoría técnica.
        </p>
    </div>
  );
}

export function SiteFooter() {
  const year = 2026;
  return (
    <footer className="mt-auto bg-hc-ink text-hc-metal">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="inline-flex rounded-lg bg-white p-2.5" aria-label="HERCAN — inicio">
            <Image
              src="/brand/hercan-logo.jpg"
              alt="HERCAN — Herramientas de Carburo de Tungsteno del Norte"
              width={200}
              height={92}
              className="h-11 w-auto"
            />
          </Link>
          <p className="mt-3 text-sm leading-relaxed">
            Herramental para CNC y equipos de medición. Distribuidor B2B industrial
            en Monterrey y todo México.
          </p>
        </div>

        <div>
          <p className="font-heading text-sm text-white">Catálogo</p>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li>
              <Link href="/categoria/fresado" className="hover:text-hc-sky">
                Fresado
              </Link>
            </li>
            <li>
              <Link href="/categoria/torneado" className="hover:text-hc-sky">
                Torneado
              </Link>
            </li>
            <li>
              <Link href="/categoria/perforacion" className="hover:text-hc-sky">
                Perforación
              </Link>
            </li>
            <li>
              <Link href="/categoria/medicion" className="hover:text-hc-sky">
                Medición
              </Link>
            </li>
            <li>
              <Link href="/productos" className="hover:text-hc-sky">
                Ver todo
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-heading text-sm text-white">Empresa</p>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li>
              <Link href="/nosotros" className="hover:text-hc-sky">
                Nosotros
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-hc-sky">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/contacto" className="hover:text-hc-sky">
                Contacto
              </Link>
            </li>
            <li>
              <Link href="/cotizacion" className="hover:text-hc-sky">
                Cotización B2B
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-heading text-sm text-white">Contacto</p>
          <ul className="mt-3 space-y-1.5 text-sm">
            {site.email && (
              <li>
                <a href={`mailto:${site.email}`} className="hover:text-hc-sky">
                  {site.email}
                </a>
              </li>
            )}
            {site.phone && (
              <li>
                <a href={`tel:${site.phone}`} className="hover:text-hc-sky">
                  {site.phone}
                </a>
              </li>
            )}
            <li>
              {site.address.city}, {site.address.state}
            </li>
          </ul>
        </div>
      </div>

      {/* Interlink sitewide a todos los hubs de taxonomía (silos SEO): garantiza que
          cada archivo reciba enlaces internos desde toda página del sitio. */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <p className="font-heading text-xs uppercase tracking-wide text-white/70">
            Explora por
          </p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {[
              { href: "/categorias", label: "Categorías" },
              { href: "/marcas", label: "Marcas" },
              { href: "/tipos", label: "Tipos de herramienta" },
              { href: "/para", label: "Por material a maquinar" },
              { href: "/materiales", label: "Material de la herramienta" },
              { href: "/recubrimientos", label: "Recubrimientos" },
              { href: "/iso", label: "Insertos ISO" },
            ].map((h) => (
              <Link key={h.href} href={h.href} className="hover:text-hc-sky">
                {h.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-hc-metal/80 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {site.legalName}. Todos los derechos reservados.</p>
          <p>
            Hecho por{" "}
            <a
              href="https://weevolveit.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-hc-metal transition-colors hover:text-hc-sky"
            >
              WeEvolveIT
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
