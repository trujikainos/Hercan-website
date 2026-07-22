"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Loader2, ImageIcon, Search } from "lucide-react";
import { formatMoney } from "@/components/ui";
import type { SearchResult } from "@/lib/shopify";

/** Producto elegido desde el catálogo real (para adjuntar a la cotización). */
export interface SelectedProduct {
  handle: string;
  title: string;
  sku: string | null;
  mpn: string | null;
  price: number | null; // precio de lista (minVariantPrice); null si desconocido
  currency: string; // ISO del precio, p. ej. "USD"
}

/**
 * Campo de autocompletar conectado al catálogo real (via /api/search).
 * Busca por título, N° de parte (MPN, embebido en el título) y SKU de variante.
 * - `onValueChange`: texto libre que ve el usuario (se envía tal cual si no elige).
 * - `onSelect`: producto estructurado al elegir del listado; null al editar a mano.
 *
 * La búsqueda se dispara por evento (al teclear), no por useEffect, para no hacer
 * setState síncrono dentro de un efecto (regla react-hooks/set-state-in-effect).
 */
export function ProductCombobox({
  id,
  value,
  onValueChange,
  onSelect,
  placeholder,
  inputClassName,
}: {
  id?: string;
  value: string;
  onValueChange: (text: string) => void;
  onSelect: (p: SelectedProduct | null) => void;
  placeholder?: string;
  inputClassName?: string;
}) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const [picked, setPicked] = useState(false); // recién se eligió → sin dropdown
  const boxRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ctrlRef = useRef<AbortController | null>(null);
  const listId = useId();

  // Búsqueda debounced con cancelación de la petición anterior.
  function runSearch(raw: string) {
    if (timerRef.current) clearTimeout(timerRef.current);
    ctrlRef.current?.abort();
    const term = raw.trim();
    if (term.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    ctrlRef.current = ctrl;
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, {
          signal: ctrl.signal,
        });
        const data = await res.json();
        setResults(data.results ?? []);
        setActive(-1);
      } catch {
        /* cancelado o error: se ignora */
      } finally {
        setLoading(false);
      }
    }, 180);
  }

  // Limpieza al desmontar (timeout + fetch en vuelo).
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ctrlRef.current?.abort();
    };
  }, []);

  // Cerrar al clic fuera.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  function choose(r: SearchResult) {
    if (timerRef.current) clearTimeout(timerRef.current);
    ctrlRef.current?.abort();
    onValueChange(r.title);
    onSelect({
      handle: r.handle,
      title: r.title,
      sku: r.sku,
      mpn: r.mpn,
      price: r.price,
      currency: r.currency,
    });
    setPicked(true);
    setOpen(false);
    setResults([]);
    setActive(-1);
  }

  function handleInput(text: string) {
    setPicked(false);
    onValueChange(text);
    onSelect(null); // editar a mano invalida la selección estructurada
    setOpen(true);
    runSearch(text);
  }

  function handleFocus() {
    setOpen(true);
    // Si llega prellenado (p. ej. desde una ficha con ?sku=…) y aún no se ha
    // buscado, dispara la búsqueda de ese valor en vez de mostrar "sin resultados".
    const term = value.trim();
    if (!picked && term.length >= 2 && results.length === 0) runSearch(term);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (open && active >= 0 && results[active]) {
        e.preventDefault(); // elegir, NO enviar el formulario
        choose(results[active]);
      }
    }
  }

  const showDropdown = open && value.trim().length >= 2 && !picked;

  function meta(r: SearchResult) {
    const parts: string[] = [];
    if (r.mpn) parts.push(`N° parte ${r.mpn}`);
    if (r.sku && r.sku !== r.mpn) parts.push(`SKU ${r.sku}`);
    return parts.join(" · ");
  }

  return (
    <div ref={boxRef} className="relative">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-hc-gunmetal"
          aria-hidden
        />
        <input
          id={id}
          type="text"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            showDropdown && active >= 0 ? `${listId}-opt-${active}` : undefined
          }
          autoComplete="off"
          value={value}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className={`${inputClassName ?? ""} pl-9 pr-9`}
        />
        {loading && (
          <Loader2
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-hc-gunmetal"
            aria-hidden
          />
        )}
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-xl border border-hc-metal-light bg-white shadow-xl">
          {results.length > 0 ? (
            <ul id={listId} role="listbox" className="max-h-[45vh] overflow-y-auto py-1">
              {results.map((r, i) => (
                <li
                  key={r.handle}
                  id={`${listId}-opt-${i}`}
                  role="option"
                  aria-selected={active === i}
                >
                  <button
                    type="button"
                    onClick={() => choose(r)}
                    onMouseEnter={() => setActive(i)}
                    className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${
                      active === i ? "bg-hc-soft" : "hover:bg-hc-soft"
                    }`}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-hc-soft text-hc-metal">
                      {r.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.image} alt="" className="h-full w-full object-contain" />
                      ) : (
                        <ImageIcon className="h-5 w-5" aria-hidden />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-hc-ink">{r.title}</span>
                      {meta(r) && (
                        <span className="block truncate font-mono text-xs text-hc-gunmetal">
                          {meta(r)}
                        </span>
                      )}
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-0.5">
                      {r.price != null && (
                        <span className="text-xs font-semibold text-hc-navy">
                          {formatMoney({ amount: String(r.price), currencyCode: r.currency })}
                        </span>
                      )}
                      <span
                        className={`text-xs ${
                          r.available ? "text-[#2e7d46]" : "text-hc-gunmetal"
                        }`}
                      >
                        {r.available ? "Disponible" : "Sobre pedido"}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : loading ? (
            <p className="px-4 py-6 text-center text-sm text-hc-gunmetal">Buscando…</p>
          ) : (
            <p className="px-4 py-5 text-center text-sm text-hc-gunmetal">
              Sin coincidencias. Puedes escribir el dato a mano y lo cotizamos igual.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
