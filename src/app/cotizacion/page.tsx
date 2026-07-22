import { AnnouncementBar, SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/home-sections";
import { JsonLd } from "@/components/json-ld";
import { pageGraph, breadcrumbNode } from "@/lib/schema";

export const metadata = {
  title: "Solicitar cotización B2B",
  description:
    "Solicita una cotización de herramentales para CNC y equipos de medición. Atención B2B industrial en México — precios por volumen y asesoría técnica.",
  alternates: { canonical: "/cotizacion" },
};

export default function CotizacionPage() {
  return (
    <>
      <JsonLd
        data={pageGraph(
          breadcrumbNode([
            { name: "Inicio", path: "/" },
            { name: "Solicitar cotización", path: "/cotizacion" },
          ]),
        )}
      />
      <AnnouncementBar />
      <SiteHeader />
      <main id="contenido" className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 text-center">
        <h1 className="reveal font-heading text-3xl text-hc-navy">Solicitar cotización</h1>
        <p className="reveal mt-3 text-hc-gunmetal" style={{ transitionDelay: "0.08s" }}>
          Flujo de cotización B2B — se implementa en la Fase 6 del proyecto.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
