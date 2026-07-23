import { FileText, Headset, Clock } from "lucide-react";
import { AnnouncementBar, SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/home-sections";
import { QuoteForm } from "@/components/quote-form";
import { getProductByHandle } from "@/lib/shopify";
import { JsonLd } from "@/components/json-ld";
import { pageGraph, breadcrumbNode } from "@/lib/schema";

export const metadata = {
  title: "Solicitar cotización B2B",
  description:
    "Solicita una cotización de herramental para CNC y equipos de medición. Precios por volumen y asesoría técnica para talleres, plantas e industria en México.",
  alternates: { canonical: "/cotizacion" },
};

export default async function CotizacionPage({
  searchParams,
}: {
  searchParams: Promise<{ sku?: string; producto?: string }>;
}) {
  const { sku, producto } = await searchParams;
  // Si viene ?producto=<handle> (desde una ficha), prellena el producto estructurado.
  const p = producto ? await getProductByHandle(producto) : undefined;
  const initialProduct = p
    ? {
        handle: p.handle,
        title: p.title,
        sku: p.sku ?? null,
        mpn: p.mpn ?? null,
        price: p.price ?? null,
        currency: p.currency,
      }
    : null;

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
      <main id="contenido" className="mx-auto w-full max-w-5xl flex-1 px-4 py-12">
        <div className="reveal max-w-2xl">
          <h1 className="font-heading text-3xl text-hc-navy">Solicitar cotización</h1>
          <p className="mt-2 text-hc-gunmetal">
            Cuéntanos qué necesitas y te respondemos con precio, disponibilidad y asesoría
            técnica. Atención B2B para talleres, plantas e integradores en todo México.
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_260px]">
          <div className="reveal">
            <QuoteForm initialSku={sku} initialProduct={initialProduct} />
          </div>

          <aside className="reveal space-y-4 text-sm" style={{ animationDelay: "0.08s" }}>
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-hc-soft text-hc-steel ring-1 ring-hc-metal-light">
                <FileText className="h-4 w-4" />
              </span>
              <div>
                <p className="font-medium text-hc-navy">Precios por volumen</p>
                <p className="text-hc-gunmetal">Cotización B2B según cantidad.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-hc-soft text-hc-steel ring-1 ring-hc-metal-light">
                <Headset className="h-4 w-4" />
              </span>
              <div>
                <p className="font-medium text-hc-navy">Asesoría técnica</p>
                <p className="text-hc-gunmetal">Te ayudamos a elegir por material y operación.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-hc-soft text-hc-steel ring-1 ring-hc-metal-light">
                <Clock className="h-4 w-4" />
              </span>
              <div>
                <p className="font-medium text-hc-navy">Respuesta rápida</p>
                <p className="text-hc-gunmetal">Sobre pedido e importación disponibles.</p>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
