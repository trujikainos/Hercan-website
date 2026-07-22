import Link from "next/link";
import { FileText, MessageCircle } from "lucide-react";
import { site } from "@/lib/site";

/**
 * Producto agotado en línea: no se puede comprar (política DENY), pero el
 * comprador puede solicitarlo bajo pedido por WhatsApp o cotización.
 */
export function OutOfStockCTA({ title, sku }: { title: string; sku: string }) {
  const waText = encodeURIComponent(
    `Hola, quiero solicitar la compra de "${title}" (N° de parte ${sku}), que aparece agotado en línea. ¿Me confirman disponibilidad, precio y tiempo de entrega?`,
  );
  return (
    <div className="mt-5 rounded-lg border border-hc-metal-light bg-hc-soft/50 p-4">
      <p className="text-sm font-semibold text-hc-ink">Agotado en línea</p>
      <p className="mt-0.5 text-sm text-hc-gunmetal">
        Solicítalo bajo pedido: te confirmamos disponibilidad, precio por volumen y
        tiempo de entrega.
      </p>
      <div className="mt-3 flex flex-wrap gap-3">
        {site.whatsapp && (
          <a
            href={`https://wa.me/${site.whatsapp}?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            data-event="generate_lead"
            className="press inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-5 py-2.5 font-medium text-white transition hover:brightness-95"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            Solicitar por WhatsApp
          </a>
        )}
        <Link
          href={`/cotizacion?sku=${encodeURIComponent(sku)}`}
          data-event="generate_lead"
          className="inline-flex items-center gap-2 rounded-lg border border-hc-blue px-5 py-2.5 font-medium text-hc-blue transition hover:bg-hc-soft"
        >
          <FileText className="h-4 w-4" aria-hidden />
          Solicitar cotización
        </Link>
      </div>
    </div>
  );
}
