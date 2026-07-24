"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronDown, ChevronRight, FileText, Wrench, X } from "lucide-react";
import type { MenuData, MenuChip, MenuCategory } from "@/lib/menu-data";
import { HUB_IMAGES } from "@/lib/hub-images";

/**
 * MEGA MENÚ "Catálogo" del nav superior.
 *
 * Client Component. Vive junto al dropdown "Más" (NavMenu) sin reemplazarlo: el
 * trigger "Catálogo ▾" abre un panel ancho con 4 zonas (riel de categorías →
 * centro con Tipos + Material a maquinar → panel derecho de marca/CTA → barra
 * inferior de marcas). En móvil el panel ancho no cabe: se colapsa a un overlay
 * a pantalla completa con acordeón de categorías.
 *
 * Interacción: abre con hover con intención (delay) y con clic/teclado; cierra
 * al salir del área (delay), con Escape y con clic fuera. Riel navegable con
 * flechas (roving tabindex) y el resto por Tab. Respeta prefers-reduced-motion
 * (motion-safe/motion-reduce + el override global de globals.css).
 *
 * ---------------------------------------------------------------------------
 * ESQUEMA DE URLs:
 *   La categoría EN SÍ (riel de categorías + "Ver todo <categoría>") y la marca
 *   EN SÍ (barra de marcas + marca destacada) enlazan a sus TAXONOMÍAS con página
 *   propia — /categoria/<slug> y /marca/<brandSlug(name)> — para posicionarlas en
 *   SEO. Los TIPOS y el MATERIAL siguen siendo FILTROS dentro de /productos:
 *   (verificado contra src/app/productos/page.tsx):
 *   - categoria = SLUG (fresado, perforacion, …)             ← filtro REAL
 *   - marca     = valor exacto (Iscar, Toolmex, …)           ← filtro REAL
 *   - material  = material de la HERRAMIENTA (Carburo, HSS,   ← filtro REAL
 *                 Cobalto). Ej: /productos?categoria=fresado&material=Carburo.
 *                 Solo se ofrece en categorías de corte (no en Medición ni
 *                 Accesorios/Abrasivos, que no tienen material de herramienta).
 *   - `tipo` (tipo_herramienta): los tipos de herramienta de corte con página de
 *     taxonomía propia (TIPO_CONTENT) enlazan a /tipo/<slug> (SEO). Los tipos de
 *     INSTRUMENTO de medición (y cualquiera sin página propia) siguen como FILTRO
 *     dentro de /productos: forward-compatible — hoy el catálogo no expone esa
 *     faceta, así que el link aterriza en la `categoria` (nunca cero resultados) y
 *     en cuanto se agregue la faceta el filtro funciona solo.
 * ---------------------------------------------------------------------------
 */

// Las categorías, tipos, materiales, recubrimientos y "material a maquinar" del mega
// menú ya NO son estáticos: vienen del CATÁLOGO REAL vía getMenuData (lib/menu-data),
// que calcula por categoría qué EXISTE en cada eje CON conteos y el href a la
// intersección filtrada. El componente solo recibe `data: MenuData` y la dibuja.

// La categoría tiene página propia (SEO) → /categoria/<slug>. Los chips CONTEXTUALES
// del panel ya traen su href a la intersección filtrada en /productos (getMenuData).
// Las MARCAS ya no viven en el mega menú: tienen su propio ítem de nav ("Marcas").
const categoriaHref = (slug: string) => `/categoria/${slug}`;

// Los 4 ejes contextuales, en orden de utilidad para el ingeniero. Cada uno se
// auto-oculta si la categoría activa no tiene datos en él.
const AXES: { key: "tipos" | "para" | "recubrimiento" | "material"; heading: string }[] = [
  { key: "tipos", heading: "Tipo de herramienta" },
  { key: "para", heading: "Para maquinar" },
  { key: "recubrimiento", heading: "Recubrimiento" },
  { key: "material", heading: "Material de herramienta" },
];
const hasAxes = (c: MenuCategory) => AXES.some((a) => c[a.key].length > 0);

// Hubs/archivos de taxonomía (índices). La fila "Explora todo" del panel: navegar la
// taxonomía COMPLETA (a diferencia de los chips, que filtran DENTRO de una categoría).
const HUBS: { href: string; label: string }[] = [
  { href: "/categorias", label: "Categorías" },
  { href: "/marcas", label: "Marcas" },
  { href: "/tipos", label: "Tipos" },
  { href: "/materiales", label: "Materiales" },
  { href: "/recubrimientos", label: "Recubrimientos" },
  { href: "/para", label: "Para maquinar" },
  { href: "/iso", label: "ISO" },
];

type Nav = () => void;

// ── Piezas reutilizables (idénticas en desktop y móvil) ─────────────────────
// Grupo de un eje: encabezado + chips con CONTEO. Cada chip enlaza a la intersección
// categoría+eje ya filtrada en /productos. No se dibuja si el eje está vacío.
function ChipGroup({
  heading,
  chips,
  onNavigate,
}: {
  heading: string;
  chips: MenuChip[];
  onNavigate: Nav;
}) {
  if (chips.length === 0) return null;
  return (
    <div>
      <h3 className="mb-2 font-heading text-[11px] font-semibold uppercase tracking-wide text-hc-gunmetal">
        {heading}
      </h3>
      <ul className="flex flex-wrap gap-1.5">
        {chips.map((c) => (
          <li key={c.href}>
            <Link
              href={c.href}
              onClick={onNavigate}
              className="inline-flex items-center gap-1.5 rounded-md border border-hc-metal-light bg-white px-2.5 py-1 text-sm text-hc-ink transition-colors hover:border-hc-steel hover:bg-hc-soft hover:text-hc-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hc-steel"
            >
              {c.label}
              <span className="text-xs text-hc-gunmetal">{c.count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function QuoteCta({ onNavigate }: { onNavigate: Nav }) {
  return (
    <Link
      href="/cotizacion"
      data-event="generate_lead"
      onClick={onNavigate}
      className="press flex items-center gap-3 rounded-lg bg-hc-navy p-4 text-white transition-colors hover:bg-hc-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hc-sky"
    >
      <FileText className="h-5 w-5 shrink-0 text-hc-sky" aria-hidden />
      <span className="flex flex-col">
        <span className="font-heading text-sm">Solicitar cotización</span>
        <span className="text-xs text-hc-sky">Respuesta B2B en horas</span>
      </span>
    </Link>
  );
}

// ── Componente principal ────────────────────────────────────────────────────
export function MegaMenu({ data }: { data: MenuData }) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0); // categoría activa del centro (desktop)
  const [mobileOpenIdx, setMobileOpenIdx] = useState<number | null>(0); // acordeón móvil

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const mobileCloseRef = useRef<HTMLButtonElement>(null);
  const catRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingFocusRail = useRef(false);
  const router = useRouter();

  const panelId = useId();
  // Categoría activa del panel (data ya viene ordenada por volumen). `active` puede
  // ser undefined si el catálogo no devolvió nada (Shopify caído) → el panel degrada.
  const active = data[activeIdx] ?? data[0];

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

  // Detecta viewport móvil (< md). Solo tras montar → sin desajuste de hidratación
  // (el panel está cerrado en el primer render, así que nada depende de esto en SSR).
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Cierre por clic fuera (solo desktop; el overlay móvil es a pantalla completa y
  // vive en un portal fuera de rootRef, así que se cierra con Escape / botón cerrar).
  useEffect(() => {
    if (!open || isMobile) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) closeNow(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, isMobile, closeNow]);

  // Escape global: cierra siempre; devuelve foco al trigger si el foco estaba dentro.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      closeNow(Boolean(rootRef.current?.contains(document.activeElement)));
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, closeNow]);

  // Bloquea el scroll del body mientras el overlay móvil está abierto.
  useEffect(() => {
    if (!(open && isMobile)) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, isMobile]);

  // Gestión de foco al abrir: overlay móvil → botón cerrar; teclado desktop → riel.
  useEffect(() => {
    if (!open) {
      pendingFocusRail.current = false;
      return;
    }
    if (isMobile) {
      mobileCloseRef.current?.focus();
    } else if (pendingFocusRail.current) {
      catRefs.current[0]?.focus();
      pendingFocusRail.current = false;
    }
  }, [open, isMobile]);

  // Limpia timers al desmontar.
  useEffect(() => clearTimers, [clearTimers]);

  // ── Hover con intención (solo mouse; en touch/pen abre el clic) ──
  const onPointerEnter = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || isMobile) return;
    clearTimers();
    openTimer.current = setTimeout(() => setOpen(true), 110);
  };
  const onPointerLeave = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || isMobile) return;
    clearTimers();
    closeTimer.current = setTimeout(() => setOpen(false), 160);
  };

  // Tab fuera del área (desktop) → cierra sin robar foco.
  const onRootBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (isMobile || !open) return;
    const next = e.relatedTarget as Node | null;
    if (next && rootRef.current && !rootRef.current.contains(next)) closeNow(false);
  };

  const onTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (isMobile) {
        setOpen(true);
        return;
      }
      if (open) {
        setActiveIdx(0);
        catRefs.current[0]?.focus();
      } else {
        setActiveIdx(0);
        pendingFocusRail.current = true;
        setOpen(true);
      }
    } else if (e.key === "Escape" && open) {
      e.preventDefault();
      closeNow(true);
    }
  };

  const onRailKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>, i: number) => {
    const n = data.length;
    let next = -1;
    if (e.key === "ArrowDown") next = (i + 1) % n;
    else if (e.key === "ArrowUp") next = (i - 1 + n) % n;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    else return;
    e.preventDefault();
    setActiveIdx(next);
    catRefs.current[next]?.focus();
  };

  return (
    <div
      ref={rootRef}
      className="relative"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onBlur={onRootBlur}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => {
          clearTimers();
          // Desktop: el panel se abre con HOVER, así que el clic navega a "ver todo".
          // Móvil: no hay hover → el clic abre/cierra el overlay.
          if (isMobile) setOpen((o) => !o);
          else {
            setOpen(false);
            router.push("/productos");
          }
        }}
        onKeyDown={onTriggerKeyDown}
        className="flex items-center gap-1.5 whitespace-nowrap rounded py-2.5 font-heading text-base text-white transition-colors hover:text-hc-sky focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hc-sky"
      >
        <Wrench className="h-5 w-5" aria-hidden />
        Catálogo
        <ChevronDown
          className={`h-5 w-5 transition-transform duration-200 motion-reduce:transition-none ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </button>

      {/* ── Panel ANCHO (desktop) ── */}
      {open && !isMobile && (
        <div
          id={panelId}
          role="region"
          aria-label="Catálogo de productos"
          className="absolute left-0 top-full z-50 w-[min(72rem,calc(100vw-2rem))] overflow-hidden rounded-b-xl border border-hc-metal-light bg-white text-hc-ink shadow-2xl motion-safe:animate-[fadeUp_0.16s_ease-out]"
        >
          <div className="h-1 w-full bg-gradient-to-r from-hc-navy via-hc-steel to-hc-sky" />
          <div className="flex">
            {/* Riel de categorías */}
            <ul className="w-56 shrink-0 border-r border-hc-metal-light bg-hc-soft py-2">
              {data.map((c, i) => {
                const isActive = i === activeIdx;
                return (
                  <li key={c.slug}>
                    <Link
                      href={categoriaHref(c.slug)}
                      ref={(el) => {
                        catRefs.current[i] = el;
                      }}
                      tabIndex={isActive ? 0 : -1}
                      aria-current={isActive ? "true" : undefined}
                      onMouseEnter={() => setActiveIdx(i)}
                      onFocus={() => setActiveIdx(i)}
                      onKeyDown={(e) => onRailKeyDown(e, i)}
                      onClick={() => closeNow(false)}
                      className={`flex items-center justify-between gap-2 px-4 py-2.5 text-sm transition-colors focus-visible:outline-none ${
                        isActive
                          ? "bg-white font-medium text-hc-navy"
                          : "text-hc-ink hover:bg-white hover:text-hc-navy"
                      }`}
                    >
                      <span className="flex items-baseline gap-1.5">
                        {c.name}
                        <span className="text-xs text-hc-gunmetal">{c.total}</span>
                      </span>
                      <ChevronRight
                        className={`h-4 w-4 transition-opacity ${isActive ? "opacity-90" : "opacity-40"}`}
                        aria-hidden
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Centro: ejes CONTEXTUALES de la categoría activa (solo los que tienen
                datos), cada chip → intersección filtrada. Sin ejes → solo "Ver todo". */}
            <div className="flex-1 p-5">
              {active && hasAxes(active) ? (
                <>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                    {AXES.map((a) => (
                      <ChipGroup
                        key={a.key}
                        heading={a.heading}
                        chips={active[a.key]}
                        onNavigate={() => closeNow(false)}
                      />
                    ))}
                  </div>
                  <Link
                    href={categoriaHref(active.slug)}
                    onClick={() => closeNow(false)}
                    className="mt-5 inline-flex items-center gap-1.5 font-heading text-sm font-semibold text-hc-navy transition-colors hover:text-hc-blue focus-visible:underline focus-visible:outline-none"
                  >
                    Ver todo {active.name}
                    <span className="text-hc-gunmetal">({active.total})</span>
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </>
              ) : (
                <div className="flex h-full min-h-[7rem] flex-col justify-center gap-2">
                  <p className="text-sm text-hc-gunmetal">
                    Explora toda la línea de {active?.name ?? "productos"} en el catálogo.
                  </p>
                  <Link
                    href={active ? categoriaHref(active.slug) : "/productos"}
                    onClick={() => closeNow(false)}
                    className="inline-flex items-center gap-1 font-heading text-sm font-semibold text-hc-navy transition-colors hover:text-hc-blue focus-visible:underline focus-visible:outline-none"
                  >
                    Ver todo {active?.name ?? "el catálogo"}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
              )}
            </div>

            {/* Panel derecho: portada de la categoría activa (hover) + CTA de cotización.
                La imagen llena el espacio y da contexto visual de la categoría. */}
            <div className="w-64 shrink-0 space-y-3 border-l border-hc-metal-light p-5">
              {active && HUB_IMAGES.categoria[active.slug] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={HUB_IMAGES.categoria[active.slug]}
                  alt={active.name}
                  className="aspect-[4/3] w-full rounded-lg border border-hc-metal-light object-cover"
                />
              )}
              <QuoteCta onNavigate={() => closeNow(false)} />
            </div>
          </div>

          {/* Barra inferior: "Explora todo" → hubs. Los chips de arriba filtran DENTRO
              de la categoría; estos hubs navegan la taxonomía completa. */}
          <div className="border-t border-hc-metal-light bg-hc-soft px-5 py-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="font-heading text-[11px] font-semibold uppercase tracking-wide text-hc-gunmetal">
                Explora todo
              </span>
              {HUBS.map((h) => (
                <Link
                  key={h.href}
                  href={h.href}
                  onClick={() => closeNow(false)}
                  className="font-heading text-sm font-semibold text-hc-navy transition-colors hover:text-hc-blue focus-visible:underline focus-visible:outline-none"
                >
                  {h.label}
                </Link>
              ))}
              <Link
                href="/productos"
                onClick={() => closeNow(false)}
                className="flex items-center gap-1 font-heading text-sm font-semibold text-hc-blue transition-colors hover:text-hc-steel focus-visible:underline focus-visible:outline-none"
              >
                Ver todo
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Overlay a pantalla completa (móvil) ──
          Portal a <body>: el <header> tiene backdrop-blur, lo que lo convierte en
          bloque contenedor de descendientes `fixed`. Sin el portal, `fixed inset-0`
          se dimensionaría al header (corto) en vez del viewport. */}
      {open &&
        isMobile &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-label="Catálogo de productos"
            className="fixed inset-0 z-50 flex flex-col bg-white text-hc-ink motion-safe:animate-[fadeUp_0.18s_ease-out]"
          >
          <div className="flex items-center justify-between border-b border-hc-metal-light px-4 py-3">
            <span className="font-heading text-lg text-hc-navy">Catálogo</span>
            <button
              ref={mobileCloseRef}
              type="button"
              onClick={() => closeNow(true)}
              aria-label="Cerrar catálogo"
              className="rounded p-1 text-hc-navy transition-colors hover:bg-hc-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hc-steel"
            >
              <X className="h-6 w-6" aria-hidden />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain">
            {/* Acordeón de categorías */}
            <ul>
              {data.map((c, i) => {
                const expanded = mobileOpenIdx === i;
                const sectionId = `${panelId}-cat-${i}`;
                return (
                  <li key={c.slug} className="border-b border-hc-metal-light">
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={sectionId}
                      onClick={() => setMobileOpenIdx(expanded ? null : i)}
                      className="flex w-full items-center justify-between px-4 py-3.5 text-left font-heading text-hc-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-hc-steel"
                    >
                      <span className="flex items-baseline gap-1.5">
                        {c.name}
                        <span className="text-xs font-normal text-hc-gunmetal">{c.total}</span>
                      </span>
                      <ChevronDown
                        className={`h-5 w-5 transition-transform duration-200 motion-reduce:transition-none ${
                          expanded ? "rotate-180" : ""
                        }`}
                        aria-hidden
                      />
                    </button>
                    {expanded && (
                      <div id={sectionId} className="space-y-4 px-4 pb-4">
                        {AXES.map((a) => (
                          <ChipGroup
                            key={a.key}
                            heading={a.heading}
                            chips={c[a.key]}
                            onNavigate={() => closeNow(false)}
                          />
                        ))}
                        <Link
                          href={categoriaHref(c.slug)}
                          onClick={() => closeNow(false)}
                          className="inline-flex items-center gap-1 text-sm font-medium text-hc-blue hover:text-hc-steel"
                        >
                          Ver todo {c.name}
                          <span className="text-hc-gunmetal">({c.total})</span>
                          <ArrowRight className="h-4 w-4" aria-hidden />
                        </Link>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* CTA de cotización + Explora todo (las marcas viven en su propio menú). */}
            <div className="space-y-3 p-4">
              <QuoteCta onNavigate={() => closeNow(false)} />
              <div className="pt-1">
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-hc-gunmetal">
                  Explora todo
                </p>
                <div className="flex flex-col gap-2">
                  {HUBS.map((h) => (
                    <Link
                      key={h.href}
                      href={h.href}
                      onClick={() => closeNow(false)}
                      className="flex items-center gap-1 font-heading text-sm font-semibold text-hc-navy hover:text-hc-blue"
                    >
                      {h.label}
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  ))}
                  <Link
                    href="/productos"
                    onClick={() => closeNow(false)}
                    className="flex items-center gap-1 font-heading text-sm font-semibold text-hc-blue hover:text-hc-steel"
                  >
                    Ver todo el catálogo
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
              </div>
            </div>
          </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
