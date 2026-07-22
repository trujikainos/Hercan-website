import Link from "next/link";
import {
  ArrowRight,
  FileText,
  ShieldCheck,
  SlidersHorizontal,
  Headset,
} from "lucide-react";
import { AnnouncementBar, SiteHeader } from "@/components/site-header";
import { SiteFooter, BrandsSection, QuoteCTA } from "@/components/home-sections";
import { JsonLd } from "@/components/json-ld";
import { pageGraph, breadcrumbNode } from "@/lib/schema";
import { site } from "@/lib/site";

export const metadata = {
  title: "Nosotros — distribuidor de herramientas de corte CNC en Monterrey",
  description:
    "HERCAN es distribuidor B2B de herramientas de corte de carburo de tungsteno y equipos de medición para CNC en Monterrey y todo México. Desde 2013: Iscar, Toolmex, YG, Palbit y Mitutoyo, con especificaciones técnicas filtrables.",
  alternates: { canonical: "/nosotros" },
};

const valores = [
  {
    icon: SlidersHorizontal,
    title: "Especificaciones técnicas filtrables",
    text: "Publicamos las specs de cada producto bajo la norma ISO 13399 —diámetro, número de filos, recubrimiento, designación ISO— para que encuentres la herramienta exacta.",
  },
  {
    icon: FileText,
    title: "Atención B2B por cotización",
    text: "Precios por volumen y facturación para talleres, plantas e integradores. Cotiza en línea y recibe precio y disponibilidad.",
  },
  {
    icon: Headset,
    title: "Asesoría técnica",
    text: "Te ayudamos a elegir la herramienta correcta según el material a maquinar y la operación de corte.",
  },
  {
    icon: ShieldCheck,
    title: "Marcas líderes",
    text: "Distribuimos marcas reconocidas de herramental de carburo de tungsteno y metrología de precisión.",
  },
];

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white px-4 py-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-hc-gunmetal">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-hc-ink">{value}</dd>
    </div>
  );
}

export default function NosotrosPage() {
  return (
    <>
      <JsonLd
        data={pageGraph(
          breadcrumbNode([
            { name: "Inicio", path: "/" },
            { name: "Nosotros", path: "/nosotros" },
          ]),
        )}
      />
      <AnnouncementBar />
      <SiteHeader />
      <main id="contenido" className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-hc-navy text-white">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-28 h-96 w-96 rounded-full bg-hc-steel/25 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-hc-blue/30 blur-3xl"
          />
          <div className="relative mx-auto max-w-7xl px-4 py-16 sm:py-20">
            <span className="hero-in inline-block rounded-full bg-hc-blue/80 px-3 py-1 text-xs text-hc-metal-light ring-1 ring-white/10">
              Desde 2013 · {site.address.city}, {site.address.state}
            </span>
            <h1 className="mt-4 max-w-3xl font-heading font-semibold leading-[1.05] text-[length:var(--step-hero)]">
              Distribuidor B2B de herramental para CNC
            </h1>
            <p
              className="hero-in mt-4 max-w-2xl text-hc-sky"
              style={{ animationDelay: "0.12s" }}
            >
              En {site.name} distribuimos herramientas de corte de carburo de
              tungsteno y equipos de medición para la industria manufacturera de
              México, con especificaciones técnicas filtrables y atención por
              cotización.
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
          </div>
        </section>

        {/* Historia + datos de la empresa */}
        <section className="mx-auto max-w-7xl px-4 py-14">
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
            <div className="reveal">
              <h2 className="font-heading text-[length:var(--step-h2)] text-hc-navy">
                Nuestra historia
              </h2>
              <div className="mt-4 space-y-4 leading-relaxed text-hc-gunmetal">
                <p>
                  {site.name} inició operaciones en 2013 en {site.address.city},{" "}
                  {site.address.state}, con un objetivo claro: acercar a los
                  talleres de maquinado y a la industria manufacturera herramientas
                  de corte de carburo de tungsteno y equipos de medición de marcas
                  líderes, con el respaldo técnico que este herramental exige.
                </p>
                <p>
                  Trabajamos en un modelo B2B: atendemos a talleres CNC, plantas de
                  manufactura e integradores que requieren fresas, insertos, brocas,
                  machuelos y portaherramientas, así como instrumentos de metrología
                  para el control dimensional de sus procesos.
                </p>
                <p>
                  Hoy operamos un catálogo en línea con las especificaciones
                  técnicas de cada producto bajo la norma ISO 13399, para que
                  encontrar la herramienta correcta sea rápido y preciso, y cerramos
                  cada compra por cotización con precio y disponibilidad.
                </p>
              </div>
            </div>

            <aside className="reveal" style={{ transitionDelay: "0.08s" }}>
              <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-hc-metal-light bg-hc-metal-light">
                <Fact label="Fundada" value="2013" />
                <Fact
                  label="Sede"
                  value={`${site.address.city}, ${site.address.state}`}
                />
                <Fact label="Modelo" value="Venta B2B por cotización" />
                <Fact label="Razón social" value={site.legalName} />
                <Fact label="RFC" value={site.rfc} />
                <Fact
                  label="Giro"
                  value="Comercio al por mayor de maquinaria y equipo para la industria manufacturera"
                />
              </dl>
            </aside>
          </div>
        </section>

        {/* Qué distribuimos */}
        <section className="mx-auto max-w-7xl px-4 pt-14 pb-10">
          <div className="reveal max-w-3xl">
            <h2 className="font-heading text-[length:var(--step-h2)] text-hc-navy">
              Qué distribuimos
            </h2>
            <p className="mt-3 leading-relaxed text-hc-gunmetal">
              Herramientas de corte de carburo de tungsteno —fresas, insertos,
              brocas, machuelos y portaherramientas— y equipos de medición para CNC
              e industria manufacturera. Estas son las marcas que manejamos:
            </p>
          </div>
        </section>
        <BrandsSection />

        {/* Propuesta de valor */}
        <section className="mx-auto max-w-7xl px-4 py-14">
          <h2 className="reveal font-heading text-[length:var(--step-h2)] text-hc-navy">
            Por qué comprar con {site.name}
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {valores.map((v, i) => (
              <div
                key={v.title}
                className="reveal flex items-start gap-3"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-hc-soft text-hc-steel ring-1 ring-hc-metal-light">
                  <v.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-medium text-hc-navy">{v.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-hc-gunmetal">
                    {v.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <QuoteCTA />
      </main>
      <SiteFooter />
    </>
  );
}
