import Link from "next/link";
import { MapPin, Mail, Phone, FileText, ArrowRight } from "lucide-react";
import { AnnouncementBar, SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/home-sections";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { JsonLd } from "@/components/json-ld";
import { pageGraph, breadcrumbNode, localBusinessNode } from "@/lib/schema";
import { site } from "@/lib/site";

export const metadata = {
  title: "Contacto — ventas y cotizaciones B2B en Monterrey",
  description:
    "Contacta a HERCAN, distribuidor de herramientas de corte para CNC y equipos de medición en Monterrey. Correo, WhatsApp de ventas y cotización B2B para la industria en todo México.",
  alternates: { canonical: "/contacto" },
};

// Dirección para Google Maps (embed sin API key + enlace a la ficha).
const mapsQuery = encodeURIComponent(
  `${site.address.street}, ${site.address.city}, ${site.address.state}, ${site.address.postalCode}, México`,
);
const mapsEmbedUrl = `https://www.google.com/maps?q=${mapsQuery}&z=15&output=embed`;
const mapsLinkUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

const waText = encodeURIComponent("Hola, me interesa cotizar herramental para CNC. ");

/** Formatea el WhatsApp (dígitos con lada) a un número legible. */
function formatWhatsApp(n: string): string {
  const d = n.replace(/\D/g, "");
  if (d.startsWith("52") && d.length === 12) {
    return `+52 ${d.slice(2, 5)} ${d.slice(5, 8)} ${d.slice(8)}`;
  }
  return `+${d}`;
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

export default function ContactoPage() {
  return (
    <>
      <JsonLd
        data={pageGraph(
          localBusinessNode(),
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
            para talleres, plantas e integradores en {site.address.city} y todo
            México.
          </p>
        </header>

        <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Datos de contacto */}
          <div className="reveal">
            <h2 className="font-heading text-[length:var(--step-h2)] text-hc-navy">
              Datos de contacto
            </h2>
            <ul className="mt-5 space-y-5">
              <ContactRow icon={MapPin} label="Dirección">
                <p className="text-hc-ink">{site.address.street}</p>
                <p className="text-hc-gunmetal">
                  {site.address.city}, {site.address.state}
                  {site.address.postalCode
                    ? ` · C.P. ${site.address.postalCode}`
                    : ""}
                </p>
                <a
                  href={mapsLinkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-hc-blue transition-colors hover:text-hc-steel"
                >
                  Ver en Google Maps
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </a>
              </ContactRow>

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
          </div>

          {/* Mapa */}
          <div className="reveal" style={{ transitionDelay: "0.08s" }}>
            <div className="overflow-hidden rounded-xl border border-hc-metal-light shadow-sm">
              <iframe
                title={`Ubicación de ${site.name} en Google Maps`}
                src={mapsEmbedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-[340px] w-full border-0 sm:h-[420px] lg:h-full lg:min-h-[460px]"
              />
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
