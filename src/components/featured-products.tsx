"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Product } from "@/lib/types";
import { ProductCard } from "./product-card";

/**
 * Grid de destacados de la home. En MÓVIL muestra solo 4 y un botón "Ver más"
 * que revela el resto; en tablet/desktop (sm+) siempre se ven todos.
 * Los que se ocultan usan `hidden sm:block`, así en desktop nunca desaparecen
 * y el botón "Ver más" es `sm:hidden` (solo móvil).
 */
export function FeaturedProducts({ products }: { products: Product[] }) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = products.length > 4;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((p, i) => (
          <div key={p.id} className={i >= 4 && !expanded ? "hidden sm:block" : undefined}>
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      {hasMore && !expanded && (
        <div className="mt-5 flex justify-center sm:hidden">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="press inline-flex items-center gap-2 rounded-lg border border-hc-blue px-5 py-2.5 text-sm font-medium text-hc-blue transition hover:bg-hc-soft"
          >
            Ver más
            <ChevronDown className="h-4 w-4" aria-hidden />
          </button>
        </div>
      )}
    </>
  );
}
