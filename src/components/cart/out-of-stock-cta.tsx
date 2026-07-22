import Link from "next/link";
import { FileText } from "lucide-react";
import { WhatsAppRequestButton } from "@/components/whatsapp-request";
import type { SelectedProduct } from "@/components/product-combobox";

/**
 * Producto agotado en línea: no se puede comprar (política DENY), pero el
 * comprador puede solicitarlo bajo pedido. Ambos caminos crean el Borrador de
 * pedido en Shopify: "Solicitar por WhatsApp" (mini-form → borrador → WhatsApp)
 * o "Solicitar cotización" (formulario completo prellenado).
 */
export function OutOfStockCTA({ product }: { product: SelectedProduct }) {
  return (
    <div className="mt-5 rounded-lg border border-hc-metal-light bg-hc-soft/50 p-4">
      <p className="text-sm font-semibold text-hc-ink">Agotado en línea</p>
      <p className="mt-0.5 text-sm text-hc-gunmetal">
        Solicítalo bajo pedido: te confirmamos disponibilidad, precio por volumen y
        tiempo de entrega.
      </p>
      <div className="mt-3 flex flex-wrap gap-3">
        <WhatsAppRequestButton product={product} variant="solid" />
        <Link
          href={`/cotizacion?producto=${encodeURIComponent(product.handle)}`}
          data-event="generate_lead"
          className="press inline-flex items-center gap-2 rounded-lg border border-hc-blue px-5 py-2.5 font-medium text-hc-blue transition hover:bg-hc-soft"
        >
          <FileText className="h-4 w-4" aria-hidden />
          Solicitar cotización
        </Link>
      </div>
    </div>
  );
}
