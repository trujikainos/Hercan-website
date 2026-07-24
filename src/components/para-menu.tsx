"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { HUB_IMAGES } from "@/lib/hub-images";

/**
 * Menú "Para maquinar" del nav superior: dropdown con los 6 grupos de material a
 * maquinar (ISO 513) → /para/[slug], + "Ver todo" → /para (el hub, la "mina de oro").
 *
 * Es el modo natural en que un ingeniero B2B busca ("necesito algo para inoxidable")
 * → entrada de primer nivel. Solo DESKTOP (`hidden md:block`): en móvil el material
 * a maquinar ya vive dentro del mega menú (chips contextuales + fila "Explora todo").
 * Interacción idéntica a MarcasMenu: hover-intención + clic + Escape + clic-fuera.
 */
const MATERIALES: { slug: string; label: string }[] = [
  { slug: "acero", label: "Acero" },
  { slug: "acero-inoxidable", label: "Inoxidable" },
  { slug: "fundicion", label: "Fundición" },
  { slug: "aluminio", label: "Aluminio" },
  { slug: "superaleaciones", label: "Superaleaciones" },
  { slug: "endurecidos", label: "Endurecidos" },
];

export function ParaMenu() {
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
        Para maquinar
        <ChevronDown
          className={`h-5 w-5 transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open && (
        <div
          id={panelId}
          role="region"
          aria-label="Herramienta por material a maquinar"
          className="absolute left-0 top-full z-50 w-[min(40rem,calc(100vw-2rem))] overflow-hidden rounded-b-xl border border-hc-metal-light bg-white text-hc-ink shadow-2xl motion-safe:animate-[fadeUp_0.16s_ease-out]"
        >
          <div className="h-1 w-full bg-gradient-to-r from-hc-navy via-hc-steel to-hc-sky" />
          <p className="px-4 pt-3 text-xs leading-relaxed text-hc-gunmetal">
            Elige el material de la pieza que vas a cortar (norma ISO 513) y te mostramos
            la herramienta adecuada.
          </p>
          <div className="grid grid-cols-2 gap-2 p-4 pt-2 sm:grid-cols-3">
            {MATERIALES.map((m) => {
              const img = HUB_IMAGES.para[m.slug];
              return (
                <Link
                  key={m.slug}
                  href={`/para/${m.slug}`}
                  onClick={() => closeNow(false)}
                  className="card-hover group flex flex-col overflow-hidden rounded-lg border border-hc-metal-light bg-white transition hover:border-hc-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hc-steel"
                >
                  {img && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt="" className="aspect-[16/9] w-full object-cover" loading="lazy" />
                  )}
                  <span className="px-2.5 py-1.5 font-heading text-sm text-hc-navy group-hover:text-hc-blue">
                    {m.label}
                  </span>
                </Link>
              );
            })}
          </div>
          <div className="flex items-center justify-end border-t border-hc-metal-light bg-hc-soft px-4 py-3">
            <Link
              href="/para"
              onClick={() => closeNow(false)}
              className="flex items-center gap-1 font-heading text-sm font-semibold text-hc-navy transition-colors hover:text-hc-blue focus-visible:underline focus-visible:outline-none"
            >
              Ver todo por material
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
