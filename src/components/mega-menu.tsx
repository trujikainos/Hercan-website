"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ArrowRight, Boxes, ChevronDown, ChevronRight, FileText, X } from "lucide-react";
import { site } from "@/lib/site";
import { brandSlug, slugify } from "@/lib/catalog";
import { TIPO_CONTENT } from "@/lib/taxonomy-content";

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

// ── Categorías del mega menú (orden por VOLUMEN del catálogo real, 3,266 SKUs) ──
// Lista LOCAL a propósito: muestra las 9 categorías reales en orden de volumen sin
// alterar `CATEGORIES` de mock-data (que alimenta el grid del home y llms.txt con
// solo 6). El `slug` coincide con las claves de TIPOS_BY_CATEGORY y con el param
// `categoria` real. Accesorios/Ranurado/Abrasivos aún no están en `CATEGORIES`, así
// que hoy sus links aterrizan en el catálogo completo (forward-compatible); cuando
// el catálogo real exponga las 9 categorías, el filtro por slug funciona solo.
type MenuCategory = { name: string; slug: string };
const MENU_CATEGORIES: MenuCategory[] = [
  { name: "Fresado", slug: "fresado" },
  { name: "Perforación", slug: "perforacion" },
  { name: "Roscado", slug: "roscado" },
  { name: "Torneado", slug: "torneado" },
  { name: "Portaherramientas", slug: "portaherramientas" },
  { name: "Accesorios", slug: "accesorios" },
  { name: "Ranurado/Tronzado", slug: "ranurado" },
  { name: "Abrasivos", slug: "abrasivos" },
  { name: "Medición", slug: "medicion" },
];

// ── Mapeo categoría (slug) → tipos REALES (tipo_herramienta / tipo_instrumento) ──
// `tipo` es el string REAL de la data (Inserto, Fresa/Endmill, Broca, …). Los tipos
// de herramienta de corte con página propia (TIPO_CONTENT) enlazan a /tipo/<slug>;
// los de INSTRUMENTO de medición siguen como filtro forward-compatible en la
// `categoria` (ver tipoHref). Accesorios y Abrasivos solo tienen tipo "Otro" → no se
// listan (ver hasTipos).
type Tipo = { label: string; tipo: string };

const TIPOS_BY_CATEGORY: Record<string, Tipo[]> = {
  fresado: [
    { label: "Fresas integrales / endmills", tipo: "Fresa/Endmill" },
    { label: "Cortadores y portainsertos", tipo: "Cortador" },
    { label: "Insertos de fresado", tipo: "Inserto" },
  ],
  perforacion: [
    { label: "Brocas", tipo: "Broca" },
    { label: "Escariadores", tipo: "Escariador" },
    { label: "Cortadores", tipo: "Cortador" },
  ],
  roscado: [
    { label: "Machuelos", tipo: "Machuelo" },
    { label: "Cortadores", tipo: "Cortador" },
    { label: "Insertos de roscado", tipo: "Inserto" },
  ],
  torneado: [
    { label: "Insertos de torneado", tipo: "Inserto" },
    { label: "Barras de mandrinar", tipo: "Barra mandrinar" },
    { label: "Cortadores", tipo: "Cortador" },
  ],
  portaherramientas: [
    { label: "Portaherramientas", tipo: "Portaherramientas" },
  ],
  ranurado: [
    { label: "Insertos de ranurado / tronzado", tipo: "Inserto" },
    { label: "Cortadores", tipo: "Cortador" },
  ],
  medicion: [
    { label: "Calibradores vernier", tipo: "Calibrador vernier" },
    { label: "Micrómetros", tipo: "Micrómetro" },
    { label: "Indicadores de carátula", tipo: "Indicador de carátula" },
  ],
};

// Categorías de herramienta de corte donde aplica el "material de herramienta"
// (Carburo/HSS/Cobalto → faceta `material`, filtro REAL). Medición (instrumentos) y
// Accesorios/Abrasivos no tienen material de herramienta → sin columna de material.
const TOOL_MATERIAL_CATEGORIES = new Set<string>([
  "fresado",
  "perforacion",
  "roscado",
  "torneado",
  "portaherramientas",
  "ranurado",
]);

const hasTipos = (slug: string) => (TIPOS_BY_CATEGORY[slug]?.length ?? 0) > 0;
const hasMaterial = (slug: string) => TOOL_MATERIAL_CATEGORIES.has(slug);

// Materiales de la HERRAMIENTA con datos reales en el catálogo. Enlazan a la faceta
// `material` (REAL, filtra hoy). Reemplaza al débil "material a maquinar" (P/M/K…),
// cuyo dominante era P-Acero y cuyo param ni siquiera se expone.
const MATERIALS: { label: string; value: string }[] = [
  { label: "Carburo", value: "Carburo" },
  { label: "HSS", value: "HSS" },
  { label: "Cobalto", value: "Cobalto" },
];

// Recubrimientos con página de taxonomía propia (SEO/AEO). Enlazan a la taxonomía
// GLOBAL /recubrimiento/<slug> (eje técnico transversal, no contextual a categoría).
const COATINGS: { label: string; slug: string }[] = [
  { label: "TiAlN", slug: "tialn" },
  { label: "TiN", slug: "tin" },
  { label: "TiCN", slug: "ticn" },
  { label: "AlCrN", slug: "alcrn" },
];

const FEATURED_BRAND = "Iscar";

// ── Constructores de URL ───────────────────────────────────────────────────
function productosHref(params: Record<string, string>): string {
  return `/productos?${new URLSearchParams(params).toString()}`;
}
// Los tipos de HERRAMIENTA DE CORTE con página de taxonomía propia (TIPO_CONTENT)
// enlazan a /tipo/<slug> (SEO). Los tipos de INSTRUMENTO de medición (y cualquiera
// sin página propia) siguen como FILTRO dentro de /productos, forward-compatible:
// hoy el catálogo no expone la faceta `tipo`, así que el param se ignora y el link
// aterriza en la `categoria` (nunca cero resultados). El material sigue como filtro.
const tipoHref = (slug: string, tipo: string) => {
  const tSlug = tipo ? slugify(tipo) : "";
  if (tSlug && TIPO_CONTENT[tSlug]) return `/tipo/${tSlug}`;
  return productosHref(tipo ? { categoria: slug, tipo } : { categoria: slug });
};
const materialHref = (slug: string, value: string) =>
  productosHref({ categoria: slug, material: value });
// Ejes técnicos GLOBALES como taxonomía con página propia (SEO): material y
// recubrimiento transversales a toda categoría. Los chips del centro siguen
// siendo el filtro CONTEXTUAL (categoría+material); estos son la vista global.
const materialTaxHref = (value: string) => `/material/${slugify(value)}`;
const coatingTaxHref = (slug: string) => `/recubrimiento/${slug}`;
// La categoría EN SÍ y la marca EN SÍ son taxonomías con página propia (SEO) →
// enlazan a /categoria/<slug> y /marca/<brandSlug(name)>, no a filtros de /productos.
const categoriaHref = (slug: string) => `/categoria/${slug}`;
const marcaHref = (name: string) => `/marca/${brandSlug(name)}`;

type Nav = () => void;

// ── Piezas reutilizables (idénticas en desktop y móvil) ─────────────────────
function TiposLinks({ slug, onNavigate }: { slug: string; onNavigate: Nav }) {
  const tipos = TIPOS_BY_CATEGORY[slug] ?? [];
  return (
    <ul className="space-y-0.5">
      {tipos.map((t) => (
        <li key={t.label}>
          <Link
            href={tipoHref(slug, t.tipo)}
            onClick={onNavigate}
            className="block rounded-md px-2 py-1.5 text-sm text-hc-ink transition-colors hover:bg-hc-soft hover:text-hc-navy focus-visible:bg-hc-soft focus-visible:text-hc-navy focus-visible:outline-none"
          >
            {t.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function MaterialChips({
  slug,
  onNavigate,
  className,
}: {
  slug: string;
  onNavigate: Nav;
  className?: string;
}) {
  return (
    <ul className={className ?? "flex flex-wrap gap-1.5"}>
      {MATERIALS.map((m) => (
        <li key={m.value}>
          <Link
            href={materialHref(slug, m.value)}
            onClick={onNavigate}
            className="inline-flex items-center rounded-md border border-hc-metal-light bg-white px-2.5 py-1 text-sm text-hc-ink transition-colors hover:border-hc-steel hover:bg-hc-soft hover:text-hc-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hc-steel"
          >
            {m.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function FeaturedBrandCard({ onNavigate }: { onNavigate: Nav }) {
  return (
    <Link
      href={marcaHref(FEATURED_BRAND)}
      onClick={onNavigate}
      className="card-hover block rounded-lg border border-hc-metal-light bg-hc-soft p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hc-steel"
    >
      <span className="text-[11px] font-semibold uppercase tracking-wide text-hc-gunmetal">
        Marca destacada
      </span>
      <span className="mt-0.5 block font-heading text-xl text-hc-navy">{FEATURED_BRAND}</span>
      <span className="mt-1 flex items-center gap-1 text-xs text-hc-steel">
        Líder mundial en corte de metal
        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </span>
    </Link>
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

function BrandLinks({ onNavigate }: { onNavigate: Nav }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-6 gap-y-1.5">
      {site.brands.map((b) => (
        <li key={b.name}>
          <Link
            href={marcaHref(b.name)}
            onClick={onNavigate}
            className="font-heading text-sm font-semibold text-hc-steel transition-colors hover:text-hc-blue focus-visible:underline focus-visible:outline-none"
          >
            {b.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Ejes técnicos globales (recubrimiento + material) como taxonomías con página
 *  propia. Se muestran en la zona inferior del panel (desktop y móvil). */
function GlobalAxes({ onNavigate }: { onNavigate: Nav }) {
  const row = "flex flex-wrap items-center gap-x-3 gap-y-1";
  const chip =
    "text-sm text-hc-steel transition-colors hover:text-hc-blue focus-visible:underline focus-visible:outline-none";
  const label =
    "font-heading text-[11px] font-semibold uppercase tracking-wide text-hc-gunmetal";
  return (
    <div className="space-y-1.5">
      <div className={row}>
        <span className={label}>Recubrimiento</span>
        {COATINGS.map((c) => (
          <Link key={c.slug} href={coatingTaxHref(c.slug)} onClick={onNavigate} className={chip}>
            {c.label}
          </Link>
        ))}
      </div>
      <div className={row}>
        <span className={label}>Material</span>
        {MATERIALS.map((m) => (
          <Link key={m.value} href={materialTaxHref(m.value)} onClick={onNavigate} className={chip}>
            {m.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── Componente principal ────────────────────────────────────────────────────
export function MegaMenu() {
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

  const panelId = useId();
  const activeSlug = MENU_CATEGORIES[activeIdx]?.slug ?? MENU_CATEGORIES[0].slug;

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
    const n = MENU_CATEGORIES.length;
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
          setOpen((o) => !o);
        }}
        onKeyDown={onTriggerKeyDown}
        className="flex items-center gap-1.5 whitespace-nowrap rounded py-2.5 font-heading text-base text-white transition-colors hover:text-hc-sky focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hc-sky"
      >
        <Boxes className="h-5 w-5" aria-hidden />
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
              {MENU_CATEGORIES.map((c, i) => {
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
                      {c.name}
                      <ChevronRight
                        className={`h-4 w-4 transition-opacity ${isActive ? "opacity-90" : "opacity-40"}`}
                        aria-hidden
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Centro: Tipos + Material de herramienta de la categoría activa.
                Accesorios/Abrasivos (sin tipos ni material) → solo "Ver todo". */}
            <div className="flex-1 p-5">
              {hasTipos(activeSlug) || hasMaterial(activeSlug) ? (
                <div
                  className={`grid gap-x-6 gap-y-2 ${
                    hasTipos(activeSlug) && hasMaterial(activeSlug)
                      ? "grid-cols-2"
                      : "grid-cols-1"
                  }`}
                >
                  {hasTipos(activeSlug) && (
                    <div>
                      <h3 className="mb-2 font-heading text-[11px] font-semibold uppercase tracking-wide text-hc-gunmetal">
                        Tipos · {MENU_CATEGORIES[activeIdx]?.name}
                      </h3>
                      <TiposLinks slug={activeSlug} onNavigate={() => closeNow(false)} />
                    </div>
                  )}
                  {hasMaterial(activeSlug) && (
                    <div>
                      <h3 className="mb-2 font-heading text-[11px] font-semibold uppercase tracking-wide text-hc-gunmetal">
                        Por material de herramienta
                      </h3>
                      <MaterialChips slug={activeSlug} onNavigate={() => closeNow(false)} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex h-full min-h-[7rem] flex-col justify-center gap-2">
                  <p className="text-sm text-hc-gunmetal">
                    Explora toda la línea de {MENU_CATEGORIES[activeIdx]?.name} en el catálogo.
                  </p>
                  <Link
                    href={categoriaHref(activeSlug)}
                    onClick={() => closeNow(false)}
                    className="inline-flex items-center gap-1 font-heading text-sm font-semibold text-hc-navy transition-colors hover:text-hc-blue focus-visible:underline focus-visible:outline-none"
                  >
                    Ver todo {MENU_CATEGORIES[activeIdx]?.name}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
              )}
            </div>

            {/* Panel derecho: marca destacada + CTA */}
            <div className="w-64 shrink-0 space-y-3 border-l border-hc-metal-light p-5">
              <FeaturedBrandCard onNavigate={() => closeNow(false)} />
              <QuoteCta onNavigate={() => closeNow(false)} />
            </div>
          </div>

          {/* Ejes globales: recubrimiento + material (taxonomías con página propia) */}
          <div className="border-t border-hc-metal-light px-5 py-3">
            <GlobalAxes onNavigate={() => closeNow(false)} />
          </div>

          {/* Barra inferior: marcas + ver todo */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hc-metal-light bg-hc-soft px-5 py-3">
            <BrandLinks onNavigate={() => closeNow(false)} />
            <Link
              href="/productos"
              onClick={() => closeNow(false)}
              className="flex items-center gap-1 font-heading text-sm font-semibold text-hc-navy transition-colors hover:text-hc-blue focus-visible:underline focus-visible:outline-none"
            >
              Ver todo el catálogo
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
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
              {MENU_CATEGORIES.map((c, i) => {
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
                      {c.name}
                      <ChevronDown
                        className={`h-5 w-5 transition-transform duration-200 motion-reduce:transition-none ${
                          expanded ? "rotate-180" : ""
                        }`}
                        aria-hidden
                      />
                    </button>
                    {expanded && (
                      <div id={sectionId} className="space-y-4 px-4 pb-4">
                        {hasTipos(c.slug) && (
                          <div>
                            <h3 className="mb-1.5 font-heading text-[11px] font-semibold uppercase tracking-wide text-hc-gunmetal">
                              Tipos
                            </h3>
                            <TiposLinks slug={c.slug} onNavigate={() => closeNow(false)} />
                          </div>
                        )}
                        {hasMaterial(c.slug) && (
                          <div>
                            <h3 className="mb-1.5 font-heading text-[11px] font-semibold uppercase tracking-wide text-hc-gunmetal">
                              Por material de herramienta
                            </h3>
                            <MaterialChips
                              slug={c.slug}
                              onNavigate={() => closeNow(false)}
                              className="flex flex-wrap gap-1.5"
                            />
                          </div>
                        )}
                        <Link
                          href={categoriaHref(c.slug)}
                          onClick={() => closeNow(false)}
                          className="inline-flex items-center gap-1 text-sm font-medium text-hc-blue hover:text-hc-steel"
                        >
                          Ver todo {c.name}
                          <ArrowRight className="h-4 w-4" aria-hidden />
                        </Link>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Marca destacada + CTA + marcas + ver todo */}
            <div className="space-y-3 p-4">
              <FeaturedBrandCard onNavigate={() => closeNow(false)} />
              <QuoteCta onNavigate={() => closeNow(false)} />
              <div className="pt-2">
                <GlobalAxes onNavigate={() => closeNow(false)} />
              </div>
              <div className="pt-2">
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-hc-gunmetal">
                  Marcas
                </p>
                <BrandLinks onNavigate={() => closeNow(false)} />
              </div>
              <Link
                href="/productos"
                onClick={() => closeNow(false)}
                className="flex items-center gap-1 pt-1 font-heading text-sm font-semibold text-hc-navy hover:text-hc-blue"
              >
                Ver todo el catálogo
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
