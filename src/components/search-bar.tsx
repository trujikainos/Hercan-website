"use client";
import { useEffect, useRef, useState } from "react";
import Link, { useLinkStatus } from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Loader2, ArrowRight } from "lucide-react";
import type { SearchResult } from "@/lib/shopify";
import { ProductImage } from "./product-image";

/** Spinner inline en un resultado mientras Next navega a su ficha: feedback
 *  inmediato antes de que aparezca el skeleton de la página. Tamaño fijo →
 *  sin layout shift; solo togglea opacidad. */
function ResultSpinner() {
  const { pending } = useLinkStatus();
  return (
    <Loader2
      className={`h-4 w-4 shrink-0 text-hc-steel transition-opacity motion-safe:animate-spin ${
        pending ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden
    />
  );
}

// Sugerencias para invitar a explorar ("prueba tu suerte"): términos reales del catálogo.
const SUGGESTIONS = ["Iscar", "broca", "inserto", "TiAlN", "fresa carburo", "machuelo"];

// Ejemplos que ROTAN en el placeholder para dar ideas de CÓMO buscar: por marca,
// tipo + medida, ISO, recubrimiento, rosca, instrumento, o por aplicación/material.
const EXAMPLES = [
  "broca de carburo 5/16",
  "inserto CNMG",
  "fresa TiAlN 4 filos",
  "Iscar",
  "machuelo M8",
  "calibrador Mitutoyo",
  "herramienta para acero inoxidable",
];

export function SearchBar() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // Placeholder con efecto MÁQUINA DE ESCRIBIR: escribe un ejemplo letra por letra,
  // lo mantiene, lo borra y pasa al siguiente. Da ideas de cómo buscar. Se detiene
  // en cuanto el usuario escribe algo (q no vacío).
  const [typed, setTyped] = useState("");
  useEffect(() => {
    if (q) return;
    let i = 0; // índice del ejemplo
    let pos = 0; // posición del cursor dentro del ejemplo
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const full = EXAMPLES[i];
      if (!deleting) {
        pos++;
        setTyped(full.slice(0, pos));
        if (pos === full.length) {
          deleting = true;
          timer = setTimeout(tick, 1500); // pausa al completar
          return;
        }
      } else {
        pos--;
        setTyped(full.slice(0, pos));
        if (pos === 0) {
          deleting = false;
          i = (i + 1) % EXAMPLES.length;
        }
      }
      timer = setTimeout(tick, deleting ? 35 : 70);
    };
    timer = setTimeout(tick, 400);
    return () => clearTimeout(timer);
  }, [q]);

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

  // Al completarse la navegación a un resultado (cambia la ruta) se cierra el
  // panel. No cerramos en el onClick del enlace para que su spinner sea visible.
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Enter/submit/chip → página de resultados completa (/buscar), filtrable.
  function go(term: string) {
    const t = term.trim();
    if (t.length < 2) return;
    setOpen(false);
    router.push(`/buscar?q=${encodeURIComponent(t)}`);
  }
  const submitSearch = () => go(q);

  const hasQuery = q.trim().length >= 2;
  const showDropdown = open; // al enfocar mostramos hint + sugerencias aunque no haya texto

  return (
    <div ref={boxRef} className="relative flex-1">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitSearch();
        }}
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
          placeholder={`Prueba: ${typed}▌`}
          aria-label="Buscar productos"
          className="w-full bg-transparent text-sm outline-none placeholder:text-hc-gunmetal"
        />
        {loading ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-hc-gunmetal" aria-hidden />
        ) : hasQuery ? (
          <kbd className="hidden shrink-0 items-center rounded border border-hc-metal-light bg-white px-1.5 py-0.5 text-[10px] font-medium text-hc-gunmetal sm:inline-flex">
            ↵ Enter
          </kbd>
        ) : null}
      </form>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-hc-metal-light bg-white shadow-xl">
          {!hasQuery ? (
            <div className="p-3">
              <p className="px-1 pb-2 text-xs leading-relaxed text-hc-gunmetal">
                Escribe <span className="font-medium text-hc-ink">lo que quieras</span> —SKU,
                marca, tipo, medida o cualquier atributo—: mientras escribes te sugerimos
                productos, y con{" "}
                <kbd className="rounded border border-hc-metal-light bg-hc-soft px-1 py-0.5 text-[10px] font-medium text-hc-ink">
                  ↵ Enter
                </kbd>{" "}
                buscas en todo el catálogo.
              </p>
              <p className="px-1 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-hc-gunmetal">
                Prueba tu suerte
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => go(s)}
                    className="press inline-flex items-center rounded-md border border-hc-metal-light bg-white px-2.5 py-1 text-sm text-hc-ink transition-colors hover:border-hc-steel hover:bg-hc-soft hover:text-hc-navy"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length > 0 ? (
            <>
              <ul className="max-h-[60vh] overflow-y-auto py-1">
                {results.map((r) => (
                  <li key={r.handle}>
                    <Link
                      href={`/producto/${r.handle}`}
                      className="flex items-center gap-3 px-3 py-2 transition-colors hover:bg-hc-soft"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-hc-metal-light">
                        <ProductImage
                          src={r.image}
                          alt={r.title}
                          imgClassName="h-full w-full object-contain"
                          iconClassName="h-5 w-auto"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-hc-ink">{r.title}</span>
                        {/* SKU / N° de parte (MPN) — claves para identificar el producto B2B. */}
                        {(r.sku || r.mpn) && (
                          <span className="mt-0.5 flex flex-wrap items-center gap-x-2 font-mono text-[11px] text-hc-gunmetal">
                            {r.sku && <span className="truncate">SKU: {r.sku}</span>}
                            {r.mpn && r.mpn !== r.sku && (
                              <span className="truncate">N° parte: {r.mpn}</span>
                            )}
                          </span>
                        )}
                        <span className={`text-xs ${r.available ? "text-[#2e7d46]" : "text-hc-gunmetal"}`}>
                          {r.available ? "Disponible" : "Sobre pedido"}
                        </span>
                      </span>
                      <ResultSpinner />
                    </Link>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={submitSearch}
                className="flex w-full items-center justify-center gap-1.5 border-t border-hc-metal-light bg-hc-soft/40 px-3 py-2.5 text-sm font-medium text-hc-blue transition-colors hover:bg-hc-soft"
              >
                Ver todos los resultados
                <kbd className="rounded border border-hc-metal-light bg-white px-1 py-0.5 text-[10px]">↵ Enter</kbd>
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </>
          ) : loading ? (
            <p className="px-4 py-6 text-center text-sm text-hc-gunmetal">Buscando…</p>
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-hc-gunmetal">Sin coincidencias rápidas para “{q}”.</p>
              <button
                type="button"
                onClick={submitSearch}
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-hc-blue hover:text-hc-steel"
              >
                Buscar “{q}” en todo el catálogo
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
