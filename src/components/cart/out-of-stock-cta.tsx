import Link from "next/link";
import { FileText } from "lucide-react";

/**
 * Producto agotado en línea: no se puede comprar (política DENY), pero el
 * comprador puede solicitarlo bajo pedido mediante una cotización que llega
 * prellenada con este producto (?producto=<handle>).
 */
export function OutOfStockCTA({ handle }: { handle: string }) {
  return (
    <div className="mt-5 rounded-lg border border-hc-metal-light bg-hc-soft/50 p-4">
      <p className="text-sm font-semibold text-hc-ink">Agotado en línea</p>
      <p className="mt-0.5 text-sm text-hc-gunmetal">
        Solicítalo bajo pedido: te confirmamos disponibilidad, precio por volumen y
        tiempo de entrega.
      </p>
      <div className="mt-3">
        <Link
          href={`/cotizacion?producto=${encodeURIComponent(handle)}`}
          data-event="generate_lead"
          className="press inline-flex items-center gap-2 rounded-lg bg-hc-blue px-5 py-2.5 font-medium text-white transition-colors hover:bg-hc-steel"
        >
          <FileText className="h-4 w-4" aria-hidden />
          Solicitar cotización
        </Link>
      </div>
    </div>
  );
}
