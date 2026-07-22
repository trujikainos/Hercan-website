import { AnnouncementBar, SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/home-sections";
import { JsonLd } from "@/components/json-ld";
import { pageGraph, breadcrumbNode } from "@/lib/schema";

export const metadata = {
  title: "Contacto — ventas y cotizaciones B2B",
  description:
    "Contacta a HERCAN para cotizaciones de herramental CNC y equipos de medición. Ventas B2B en Monterrey y todo México.",
  alternates: { canonical: "/contacto" },
};

export default function ContactoPage() {
  return (
    <>
      <JsonLd
        data={pageGraph(
          breadcrumbNode([
            { name: "Inicio", path: "/" },
            { name: "Contacto", path: "/contacto" },
          ]),
        )}
      />
      <AnnouncementBar />
      <SiteHeader />
      <main id="contenido" className="mx-auto w-full max-w-3xl flex-1 px-4 py-14">
        <h1 className="reveal font-heading text-3xl text-hc-navy">Contacto</h1>
        <p className="reveal mt-4 text-hc-gunmetal" style={{ transitionDelay: "0.08s" }}>
          Estamos preparando esta sección con nuestros datos de contacto, formulario y
          ubicación. Mientras tanto, puedes{" "}
          <a href="/cotizacion" className="text-hc-blue hover:underline">
            solicitar una cotización
          </a>
          .
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
