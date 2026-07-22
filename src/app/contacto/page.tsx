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
 * Query de Google Maps para una sucursal. Si no hay calle (p. ej. Saltillo, por
 * confirmar) se geocodifica por ciudad → NO se inventa dirección.
 */
function locationMapsQuery(loc: (typeof site.locations)[number]): string {
  const parts = loc.street
    ? [loc.street, loc.city, loc.state, loc.postalCode, "México"]
    : [loc.city, loc.state, "México"];
  return encodeURIComponent(parts.filter(Boolean).join(", "));
}

function ContactRow({
  icon: Icon,
  label,
  iconClass = "text-hc-steel",
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  iconClass?: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-hc-soft ring-1 ring-hc-metal-light">
        <Icon className={`h-5 w-5 ${iconClass}`} />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-hc-gunmetal">
          {label}
        </p>
        <div className="mt-0.5 text-sm">{children}</div>
      </div>
    </li>
  );
}

/** Tarjeta de una sucursal: dirección (o ciudad) + su propio mapa embebido. */
function BranchCard({
  loc,
  index,
}: {
  loc: (typeof site.locations)[number];
  index: number;
}) {
  const query = locationMapsQuery(loc);
  // Sin API key: iframe de Google Maps con ?q=<dirección|ciudad>&output=embed.
  // Zoom mayor cuando hay calle exacta; menor cuando sólo se ubica la ciudad.
  const mapsEmbedUrl = `https://www.google.com/maps?q=${query}&z=${loc.street ? 15 : 12}&output=embed`;
  const mapsLinkUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
  const hasStreet = Boolean(loc.street);

  return (
    <article
      className="reveal flex flex-col overflow-hidden rounded-xl border border-hc-metal-light bg-white shadow-sm"
      style={{ transitionDelay: `${index * 0.08}s` }}
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-hc-soft ring-1 ring-hc-metal-light">
            <MapPin className="h-5 w-5 text-hc-steel" aria-hidden />
          </span>
          <div className="min-w-0">
            <h3 className="font-heading text-lg text-hc-navy">
              Sucursal {loc.name}
            </h3>
            {hasStreet ? (
              <>
                <p className="mt-0.5 text-sm text-hc-ink">{loc.street}</p>
                <p className="text-sm text-hc-gunmetal">
                  {loc.city}, {loc.state}
                  {loc.postalCode ? ` · C.P. ${loc.postalCode}` : ""}
                </p>
              </>
            ) : (
              <>
                <p className="mt-0.5 text-sm text-hc-ink">
                  {loc.city}, {loc.state}
                </p>
                <p className="text-sm italic text-hc-gunmetal">
                  Dirección exacta por confirmar
                </p>
              </>
            )}
            <a
              href={mapsLinkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1.5 inline-flex items-center gap-1 text-sm text-hc-blue transition-colors hover:text-hc-steel"
            >
              Ver en Google Maps
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </a>
          </div>
        </div>
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

        {/* Datos de contacto generales + CTAs */}
        <section className="reveal mt-10">
          <h2 className="font-heading text-[length:var(--step-h2)] text-hc-navy">
            Datos de contacto
          </h2>
          <ul className="mt-5 grid gap-5 sm:grid-cols-2">
            {site.email && (
              <ContactRow icon={Mail} label="Correo">
                <a
                  href={`mailto:${site.email}`}
                  className="text-hc-blue transition-colors hover:text-hc-steel"
                >
                  {site.email}
                </a>
              </ContactRow>
            )}

            {site.whatsapp && (
              <ContactRow
                icon={WhatsAppIcon}
                label="WhatsApp"
                iconClass="text-[#25D366]"
              >
                <a
                  href={`https://wa.me/${site.whatsapp}?text=${waText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-event="contact_whatsapp"
                  className="text-hc-blue transition-colors hover:text-hc-steel"
                >
                  {formatWhatsApp(site.whatsapp)}
                </a>
              </ContactRow>
            )}

            {/* site.phone está vacío hasta confirmar → sólo se renderiza si existe */}
            {site.phone && (
              <ContactRow icon={Phone} label="Teléfono">
                <a
                  href={`tel:${site.phone}`}
                  className="text-hc-blue transition-colors hover:text-hc-steel"
                >
                  {site.phone}
                </a>
              </ContactRow>
            )}
            {/* TODO: horario de atención por confirmar con el cliente */}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            {site.whatsapp && (
              <a
                href={`https://wa.me/${site.whatsapp}?text=${waText}`}
                target="_blank"
                rel="noopener noreferrer"
                data-event="contact_whatsapp"
                className="press inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-5 py-2.5 font-medium text-white transition hover:brightness-95"
              >
                <WhatsAppIcon className="h-5 w-5" />
                Escríbenos por WhatsApp
              </a>
            )}
            <Link
              href="/cotizacion"
              data-event="generate_lead"
              className="press inline-flex items-center gap-2 rounded-lg bg-hc-steel px-5 py-2.5 font-medium text-white transition-colors hover:bg-hc-blue"
            >
              <FileText className="h-4 w-4" aria-hidden />
              Solicitar cotización
            </Link>
          </div>

          <p className="mt-6 text-sm leading-relaxed text-hc-gunmetal">
            También puedes{" "}
            <Link
              href="/cotizacion"
              className="text-hc-blue transition-colors hover:text-hc-steel hover:underline"
            >
              solicitar una cotización en línea
            </Link>{" "}
            con tu lista de productos y recibir precio por volumen.
          </p>
        </section>

        {/* Sucursales — una tarjeta con mapa propio por ubicación */}
        <section className="mt-14">
          <div className="reveal max-w-2xl">
            <h2 className="font-heading text-[length:var(--step-h2)] text-hc-navy">
              Nuestras sucursales
            </h2>
            <p className="mt-2 leading-relaxed text-hc-gunmetal">
              Atendemos a la industria del noreste de México desde nuestras sucursales
              en {branchNames}.
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
