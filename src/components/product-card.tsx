import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/lib/types";
import { StockBadge, formatPrice, displayTitle } from "./ui";
import { ProductImage } from "./product-image";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/producto/${product.handle}`}
      className="card-hover group flex flex-col overflow-hidden rounded-xl border border-hc-metal-light bg-white hover:border-hc-steel"
    >
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

      <div className="flex flex-1 flex-col p-3.5">
        {/* Número de parte — clave para B2B/SEO */}
        <p className="font-mono text-[11px] font-medium tracking-tight text-hc-steel">
          {product.sku}
        </p>
        <h3 className="mt-1 line-clamp-2 text-[15px] font-semibold leading-snug text-hc-ink transition-colors group-hover:text-hc-blue">
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
  );
}
