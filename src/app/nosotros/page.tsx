import { AnnouncementBar, SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/home-sections";
import { JsonLd } from "@/components/json-ld";
import { pageGraph, breadcrumbNode } from "@/lib/schema";

export const metadata = {
  title: "Nosotros — distribuidor de herramental CNC en México",
  description:
    "HERCAN, distribuidor B2B de herramientas de corte para CNC y equipos de medición en Monterrey. Marcas líderes, asesoría técnica y cotización por volumen.",
  alternates: { canonical: "/nosotros" },
};

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
      <main id="contenido" className="mx-auto w-full max-w-3xl flex-1 px-4 py-14">
        <h1 className="reveal font-heading text-3xl text-hc-navy">Nosotros</h1>
        <p className="reveal mt-4 text-hc-gunmetal" style={{ transitionDelay: "0.08s" }}>
          Estamos preparando esta sección con la historia de HERCAN, las marcas que
          distribuimos y nuestra propuesta B2B. Muy pronto.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
