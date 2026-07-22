"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Product } from "@/lib/types";
import { ProductCard } from "./product-card";

const INITIAL = 4;

export function RelatedProducts({ products }: { products: Product[] }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? products : products.slice(0, INITIAL);
  const hasMore = products.length > INITIAL;

  return (
    <>
      <div
        id="relacionados-grid"
        className="stagger-in grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
      >
        {visible.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            aria-expanded={showAll}
            aria-controls="relacionados-grid"
            className="press inline-flex items-center gap-2 rounded-lg border border-hc-blue px-5 py-2.5 text-sm font-medium text-hc-blue transition hover:bg-hc-soft"
          >
            {showAll ? "Mostrar menos" : `Mostrar más (${products.length - INITIAL})`}
            <ChevronDown
              className={`h-4 w-4 transition-transform ${showAll ? "rotate-180" : ""}`}
              aria-hidden
            />
          </button>
        </div>
      )}
    </>
  );
}
