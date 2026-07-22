import Link from "next/link";
import { MapPin, Mail, Phone, FileText, ArrowRight } from "lucide-react";
import { AnnouncementBar, SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/home-sections";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { JsonLd } from "@/components/json-ld";
import { pageGraph, breadcrumbNode, localBusinessNode } from "@/lib/schema";
import { site } from "@/lib/site";

// Nombres de sucursales derivados de la fuente de verdad → "Monterrey y Saltillo".
const branchNames = site.locations.map((l) => l.name).join(" y ");

export const metadata = {
  title: `Contacto — sucursales en ${branchNames}`,
  description:
    `Contacta a HERCAN, distribuidor de herramientas de corte para CNC y equipos de medición. Sucursales en ${branchNames}. Correo, WhatsApp de ventas y cotización B2B para la industria en todo México.`,
  alternates: { canonical: "/contacto" },
};

const waText = encodeURIComponent("Hola, me interesa cotizar herramental para CNC. ");

/** Formatea el WhatsApp (dígitos con lada) a un número legible. */
function formatWhatsApp(n: string): string {
  const d = n.replace(/\D/g, "");
  if (d.startsWith("52") && d.length === 12) {
    return `+52 ${d.slice(2, 5)} ${d.slice(5, 8)} ${d.slice(8)}`;
  }
  return `+${d}`;
}

/**
 * Query de Google Maps para una sucursal (dirección real → mejor geocodificación).
 * Si faltara la calle, cae a ciudad+estado (no se inventa dirección).
 */
function locationMapsQuery(loc: (typeof site.locations)[number]): string {
  // Se accede a los campos sin condicionar (evita narrowing a never con `as const`);
  // los vacíos se descartan con filter → si faltara calle/CP, geocodifica por ciudad.
  const parts = [loc.street, loc.city, loc.state, loc.postalCode, "México"];
  return encodeURIComponent(parts.filter(Boolean).join(", "));
}

/** Tarjeta de una sucursal: dirección, contacto propio (tel/WhatsApp/correo) y su mapa. */
function BranchCard({
  loc,
  index,
}: {
  loc: (typeof site.locations)[number];
  index: number;
}) {
  const query = locationMapsQuery(loc);
  // Sin API key: iframe de Google Maps con ?q=<dirección>&output=embed.
  const mapsEmbedUrl = `https://www.google.com/maps?q=${query}&z=${loc.street ? 15 : 12}&output=embed`;
  const mapsLinkUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
  // tel: en E.164 (dígitos con "+"), ej. "+52 812 235 9988" → "tel:+528122359988".
  const telHref = `tel:+${loc.phone.replace(/\D/g, "")}`;

  return (
    <article
      className="reveal flex flex-col overflow-hidden rounded-xl border border-hc-metal-light bg-white shadow-sm"
      style={{ transitionDelay: `${index * 0.08}s` }}
    >
      <div className="p-5 sm:p-6">
        {/* Dirección */}
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-hc-soft ring-1 ring-hc-metal-light">
            <MapPin className="h-5 w-5 text-hc-steel" aria-hidden />
          </span>
          <div className="min-w-0">
            <h3 className="font-heading text-lg text-hc-navy">
              Sucursal {loc.name}
            </h3>
            <p className="mt-0.5 text-sm text-hc-ink">{loc.street}</p>
            <p className="text-sm text-hc-gunmetal">
              {loc.city}, {loc.state}
              {loc.postalCode ? ` · C.P. ${loc.postalCode}` : ""}
            </p>
          </div>
        </div>

        {/* Contacto directo de la sucursal */}
        <ul className="mt-4 space-y-2.5 border-t border-hc-metal-light pt-4 text-sm">
          <li className="flex items-center gap-2.5">
            <Phone className="h-4 w-4 shrink-0 text-hc-steel" aria-hidden />
            <a
              href={telHref}
              className="text-hc-blue transition-colors hover:text-hc-steel"
              aria-label={`Llamar a la sucursal ${loc.name}`}
            >
              {loc.phone}
            </a>
          </li>
          <li className="flex items-center gap-2.5">
            <WhatsAppIcon className="h-4 w-4 shrink-0 text-[#25D366]" />
            <a
              href={`https://wa.me/${loc.whatsapp}?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              data-event="contact_whatsapp"
              className="text-hc-blue transition-colors hover:text-hc-steel"
              aria-label={`WhatsApp de la sucursal ${loc.name}`}
            >
              {formatWhatsApp(loc.whatsapp)}
            </a>
          </li>
          <li className="flex items-center gap-2.5">
            <Mail className="h-4 w-4 shrink-0 text-hc-steel" aria-hidden />
            <a
              href={`mailto:${loc.email}`}
              className="break-all text-hc-blue transition-colors hover:text-hc-steel"
            >
              {loc.email}
            </a>
          </li>
        </ul>

        <a
          href={mapsLinkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1 text-sm text-hc-blue transition-colors hover:text-hc-steel"
        >
          Ver en Google Maps
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </a>
      </div>

      <div className="border-t border-hc-metal-light">
        <iframe
          title={`Mapa de la sucursal de ${site.name} en ${loc.city}, ${loc.state}`}
          src={mapsEmbedUrl}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-[300px] w-full border-0 sm:h-[340px]"
        />
      </div>
    </article>
  );
}

export default function ContactoPage() {
  return (
    <>
      <JsonLd
        data={pageGraph(
          // Un LocalBusiness por sucursal (@id distinto, mismo parentOrganization).
          ...site.locations.map((loc) => localBusinessNode(loc)),
          breadcrumbNode([
            { name: "Inicio", path: "/" },
            { name: "Contacto", path: "/contacto" },
          ]),
        )}
      />
      <AnnouncementBar />
      <SiteHeader />
      <main id="contenido" className="mx-auto w-full max-w-6xl flex-1 px-4 py-12">
        <header className="reveal max-w-2xl">
          <h1 className="font-heading text-3xl text-hc-navy">Contacto</h1>
          <p className="mt-2 leading-relaxed text-hc-gunmetal">
            ¿Necesitas herramental para CNC o equipos de medición? Escríbenos y te
            respondemos con precio, disponibilidad y asesoría técnica. Atención B2B
            para talleres, plantas e integradores, con sucursales en {branchNames} y
            servicio en todo México.
          </p>
        </header>

        {/* CTA general — el contacto por canal vive en cada sucursal (abajo) */}
        <section className="reveal mt-8 flex flex-wrap items-center gap-x-4 gap-y-3">
          <Link
            href="/cotizacion"
            data-event="generate_lead"
            className="press inline-flex items-center gap-2 rounded-lg bg-hc-steel px-5 py-2.5 font-medium text-white transition-colors hover:bg-hc-blue"
          >
            <FileText className="h-4 w-4" aria-hidden />
            Solicitar cotización
          </Link>
          <p className="max-w-md text-sm text-hc-gunmetal">
            Cotiza con tu lista de productos y recibe precio por volumen, o contáctanos
            directo en tu{" "}
            <a
              href="#sucursales"
              className="text-hc-blue transition-colors hover:text-hc-steel hover:underline"
            >
              sucursal más cercana
            </a>
            <span aria-hidden> ↓</span>.
          </p>
        </section>

        {/* Sucursales — una tarjeta con contacto y mapa propios por ubicación */}
        <section id="sucursales" className="mt-14 scroll-mt-24">
          <div className="reveal max-w-2xl">
            <h2 className="font-heading text-[length:var(--step-h2)] text-hc-navy">
              Nuestras sucursales
            </h2>
            <p className="mt-2 leading-relaxed text-hc-gunmetal">
              Atendemos a la industria del noreste de México desde nuestras sucursales
              en {branchNames}. Llámanos, escríbenos por WhatsApp o visítanos.
            </p>
          </div>
          <div className="mt-6 grid gap-8 lg:grid-cols-2">
            {site.locations.map((loc, i) => (
              <BranchCard key={loc.name} loc={loc} index={i} />
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
