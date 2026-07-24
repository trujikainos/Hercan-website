import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/lib/types";
import { StockBadge, formatPrice, displayTitle } from "./ui";
import { ProductImage } from "./product-image";
import { CopyButton } from "./copy-button";

export function ProductCard({ product }: { product: Product }) {
  return (
    // Wrapper = elemento que recibe la animación de entrada (`stagger-in > *`
    // en /productos, relacionados y alternativas, o `reveal` en la home). Al
    // separarlo del <Link>, la animación fija el `transform` del wrapper (con
    // fill-mode both) sin pisar el `transform` del hover de la card. Así el
    // `card-hover` (elevación translateY) funciona idéntico en TODAS las páginas.
    <div className="flex">
      <div className="card-hover group flex w-full flex-col overflow-hidden rounded-xl border border-hc-metal-light bg-white hover:border-hc-steel">
        <Link href={`/producto/${product.handle}`} className="flex flex-1 flex-col">
          <div className="relative flex h-36 items-center justify-center overflow-hidden bg-hc-soft text-hc-metal">
            <ProductImage
              src={product.image}
              alt={`${displayTitle(product.title)} — ${product.sku}`}
              imgClassName="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.05]"
            />
            {/* Marca (chip) */}
            <span className="absolute left-2 top-2 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-hc-navy ring-1 ring-hc-metal-light backdrop-blur-sm">
              {product.brand}
            </span>
            {/* Disponibilidad */}
            <span className="absolute right-2 top-2">
              <StockBadge product={product} />
            </span>
          </div>

          <div className="flex flex-1 flex-col px-3.5 pb-2 pt-3.5">
            <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-hc-ink transition-colors group-hover:text-hc-blue">
              {displayTitle(product.title)}
            </h3>
            <p className="mt-0.5 text-xs text-hc-gunmetal">{product.category}</p>

            <div className="mt-auto flex items-center justify-between pt-3">
              <span className="font-heading text-lg text-hc-navy">{formatPrice(product)}</span>
              <span className="flex items-center gap-1 text-xs font-medium text-hc-blue opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                Ver ficha
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </span>
            </div>
          </div>
        </Link>

        {/* SKU + N° de parte (MPN) con copiar — FUERA del Link para no navegar al
            copiar. Claves para la orden de compra B2B. */}
        <div className="space-y-0.5 border-t border-hc-metal-light/70 px-3.5 py-2">
          <div className="flex items-center justify-between gap-2">
            <span className="min-w-0 truncate font-mono text-[11px] font-medium tracking-tight text-hc-steel">
              SKU: {product.sku}
            </span>
            <CopyButton value={product.sku} label={`SKU ${product.sku}`} small />
          </div>
          {product.mpn && product.mpn !== product.sku && (
            <div className="flex items-center justify-between gap-2">
              <span className="min-w-0 truncate font-mono text-[11px] tracking-tight text-hc-gunmetal">
                N° parte: {product.mpn}
              </span>
              <CopyButton value={product.mpn} label={`N° de parte ${product.mpn}`} small />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
