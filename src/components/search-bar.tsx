"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, Loader2, ImageIcon } from "lucide-react";
import type { SearchResult } from "@/lib/shopify";

export function SearchBar() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // Búsqueda debounced con cancelación de peticiones en vuelo
  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: ctrl.signal,
        });
        const data = await res.json();
        setResults(data.results ?? []);
      } catch {
        /* petición cancelada o error: se ignora */
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  // Cerrar al clic fuera
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const showDropdown = open && q.trim().length >= 2;

  return (
    <div ref={boxRef} className="relative flex-1">
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex items-center gap-2 rounded-lg border border-hc-metal-light bg-hc-soft px-3 py-2 transition-colors focus-within:border-hc-steel"
      >
        <Search className="h-4 w-4 shrink-0 text-hc-gunmetal" aria-hidden />
        <input
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          placeholder="Buscar SKU, N° de parte, marca u otro atributo…"
          aria-label="Buscar productos"
          className="w-full bg-transparent text-sm outline-none placeholder:text-hc-gunmetal"
        />
        {loading && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-hc-gunmetal" aria-hidden />}
      </form>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-hc-metal-light bg-white shadow-xl">
          {results.length > 0 ? (
            <ul className="max-h-[65vh] overflow-y-auto py-1">
              {results.map((r) => (
                <li key={r.handle}>
                  <Link
                    href={`/producto/${r.handle}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 transition-colors hover:bg-hc-soft"
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
                      <span className={`text-xs ${r.available ? "text-[#2e7d46]" : "text-hc-gunmetal"}`}>
                        {r.available ? "Disponible" : "Sobre pedido"}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : loading ? (
            <p className="px-4 py-6 text-center text-sm text-hc-gunmetal">Buscando…</p>
          ) : (
            <p className="px-4 py-6 text-center text-sm text-hc-gunmetal">
              Sin resultados para “{q}”.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
