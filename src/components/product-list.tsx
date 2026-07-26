"use client";

import { useSyncExternalStore } from "react";
import { LayoutGrid, List } from "lucide-react";
import type { Product } from "@/lib/types";
import { ProductCard, type ProductView } from "./product-card";

const STORAGE_KEY = "hc_product_view";
const CHANGE_EVENT = "hc-view-change";

// La preferencia de vista vive en localStorage (persiste entre páginas del catálogo).
// useSyncExternalStore la lee sin provocar hydration mismatch: en SSR y en la primera
// hidratación devuelve "grid"; ya montado, React re-renderiza con el valor guardado.
function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(CHANGE_EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(CHANGE_EVENT, cb);
  };
}
function getSnapshot(): ProductView {
  return localStorage.getItem(STORAGE_KEY) === "list" ? "list" : "grid";
}
const getServerSnapshot = (): ProductView => "grid";

function setView(v: ProductView) {
  localStorage.setItem(STORAGE_KEY, v);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function ProductList({ products, total }: { products: Product[]; total: number }) {
  const view = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const btn = (v: ProductView, Icon: typeof LayoutGrid, label: string) => (
    <button
      type="button"
      onClick={() => setView(v)}
      aria-pressed={view === v}
      aria-label={`Ver en ${label}`}
      title={`Ver en ${label}`}
      className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
        view === v ? "bg-white text-hc-blue shadow-sm" : "text-hc-gunmetal hover:text-hc-navy"
      }`}
    >
      <Icon className="h-4 w-4" aria-hidden />
    </button>
  );

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm text-hc-gunmetal">
          {total} producto{total === 1 ? "" : "s"}
        </p>
        <div
          role="group"
          aria-label="Vista de productos"
          className="flex items-center gap-0.5 rounded-lg border border-hc-metal-light bg-hc-soft p-0.5"
        >
          {btn("grid", LayoutGrid, "cuadrícula")}
          {btn("list", List, "lista")}
        </div>
      </div>

      <div
        className={
          view === "grid"
            ? "stagger-in grid grid-cols-2 gap-3 sm:grid-cols-3"
            : "stagger-in flex flex-col gap-3"
        }
      >
        {products.map((p) => (
          <ProductCard key={p.id} product={p} view={view} />
        ))}
      </div>
    </>
  );
}
