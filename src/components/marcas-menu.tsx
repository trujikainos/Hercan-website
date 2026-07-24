"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { site } from "@/lib/site";
import { brandSlug } from "@/lib/catalog";

/**
 * Menú "Marcas" del nav superior: dropdown con los logos de las marcas que
 * distribuye HERCAN → /marca/[slug], + "Ver todas" → /marcas (el hub).
 *
 * Solo DESKTOP (`hidden md:block`): en móvil las marcas ya viven dentro del mega
 * menú "Catálogo" (sección Marcas + "Ver todas las marcas"), así que aquí evitamos
 * duplicar el overlay móvil. Abre con hover-intención y clic; cierra con Escape,
 * clic fuera y al navegar. Respeta prefers-reduced-motion (motion-safe + globals).
 */
export function MarcasMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelId = useId();

  const clearTimers = useCallback(() => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    openTimer.current = null;
    closeTimer.current = null;
  }, []);

  const closeNow = useCallback(
    (returnFocus = false) => {
      clearTimers();
      setOpen(false);
      if (returnFocus) triggerRef.current?.focus();
    },
    [clearTimers],
  );

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) closeNow(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeNow(Boolean(rootRef.current?.contains(document.activeElement)));
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, closeNow]);

  useEffect(() => clearTimers, [clearTimers]);

  const onEnter = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    clearTimers();
    openTimer.current = setTimeout(() => setOpen(true), 110);
  };
  const onLeave = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    clearTimers();
    closeTimer.current = setTimeout(() => setOpen(false), 160);
  };

  return (
    <div
      ref={rootRef}
      className="relative hidden md:block"
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => {
          clearTimers();
          setOpen((o) => !o);
        }}
        className="flex items-center gap-1.5 whitespace-nowrap rounded py-2.5 font-heading text-base text-white transition-colors hover:text-hc-sky focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hc-sky"
      >
        Marcas
        <ChevronDown
          className={`h-5 w-5 transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open && (
        <div
          id={panelId}
          role="region"
          aria-label="Marcas que distribuimos"
          className="absolute left-0 top-full z-50 w-[min(44rem,calc(100vw-2rem))] overflow-hidden rounded-b-xl border border-hc-metal-light bg-white text-hc-ink shadow-2xl motion-safe:animate-[fadeUp_0.16s_ease-out]"
        >
          <div className="h-1 w-full bg-gradient-to-r from-hc-navy via-hc-steel to-hc-sky" />
          <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-3">
            {site.brands.map((b) => (
              <Link
                key={b.name}
                href={`/marca/${brandSlug(b.name)}`}
                onClick={() => closeNow(false)}
                aria-label={b.name}
                className="card-hover flex h-16 items-center justify-center rounded-lg border border-hc-metal-light bg-white px-3 transition hover:border-hc-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hc-steel"
              >
                {b.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.logo} alt={b.name} className="max-h-9 w-auto object-contain" />
                ) : (
                  <span className="font-heading text-lg font-semibold text-hc-steel">{b.name}</span>
                )}
              </Link>
            ))}
          </div>
          <div className="flex items-center justify-end border-t border-hc-metal-light bg-hc-soft px-4 py-3">
            <Link
              href="/marcas"
              onClick={() => closeNow(false)}
              className="flex items-center gap-1 font-heading text-sm font-semibold text-hc-navy transition-colors hover:text-hc-blue focus-visible:underline focus-visible:outline-none"
            >
              Ver todas las marcas
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
