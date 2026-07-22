"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ArrowRight, ChevronDown, ChevronRight, FileText, LayoutGrid, X } from "lucide-react";
import { CATEGORIES } from "@/lib/mock-data";
import { site } from "@/lib/site";
import { WhatsAppIcon } from "@/components/whatsapp-icon";

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
 * ESQUEMA DE URLs (verificado contra src/app/productos/page.tsx):
 *   - categoria = SLUG (fresado, torneado, …)                 ← filtro REAL
 *   - marca     = valor exacto (Iscar, Toolmex, …)            ← filtro REAL
 *   - material  = valor (Carburo, HSS…) → material de la HERRAMIENTA, NO el de
 *                 maquinar. Por eso las fichas "Por material a maquinar" usan un
 *                 parámetro propio `material_a_maquinar` (el metafield real del
 *                 sistema, ver lib/shopify.ts SPEC_FIELDS). Hoy el catálogo aún
 *                 no expone esa faceta, así que ese parámetro se ignora y el link
 *                 aterriza en la categoría (nunca cero resultados); en cuanto se
 *                 agregue la faceta al catálogo el filtro funciona solo.
 *   - `tipo` (tipo_herramienta) idéntico caso: forward-compatible, la `categoria`
 *     que lo acompaña es el filtro REAL que garantiza resultados.
 * ---------------------------------------------------------------------------
 */

// ── Mapeo categoría (slug) → tipos de herramienta ──────────────────────────
// Valores de `tipo` alineados al vocabulario tipo_herramienta / tipo_instrumento
// de CLAUDE.md y a los `type` de la data (Inserto, Fresa/Endmill, Broca, …).
type Tipo = { label: string; tipo: string };

const TIPOS_BY_CATEGORY: Record<string, Tipo[]> = {
  fresado: [
    { label: "Insertos de fresado", tipo: "Inserto" },
    { label: "Fresas integrales / endmills", tipo: "Fresa/Endmill" },
    { label: "Cabezales intercambiables", tipo: "Cabezal" },
    { label: "Cortadores y portainsertos", tipo: "Cortador" },
  ],
  torneado: [
    { label: "Insertos de torneado", tipo: "Inserto" },
    { label: "Portaherramientas de torno", tipo: "Portaherramientas" },
    { label: "Barras de mandrinar", tipo: "Barra mandrinar" },
  ],
  perforacion: [
    { label: "Brocas", tipo: "Broca" },
    { label: "Cabezales de perforación", tipo: "Cabezal" },
    { label: "Escariadores", tipo: "Escariador" },
  ],
  roscado: [
    { label: "Machuelos", tipo: "Machuelo" },
    { label: "Insertos de roscado", tipo: "Inserto" },
    { label: "Fresas de roscado", tipo: "Fresa/Endmill" },
  ],
  portaherramientas: [
    { label: "Mangos y conos (BT/HSK/Weldon)", tipo: "Portaherramientas" },
    { label: "Barras de mandrinar", tipo: "Barra mandrinar" },
    { label: "Extensiones y adaptadores", tipo: "Portaherramientas" },
  ],
  medicion: [
    { label: "Calibradores vernier", tipo: "Calibrador vernier" },
    { label: "Micrómetros", tipo: "Micrómetro" },
    { label: "Indicadores de carátula", tipo: "Indicador carátula" },
  ],
};

// Grupos ISO 513 de material a maquinar (globales a todas las categorías).
// `value` sigue la lista maestra de CLAUDE.md (material_a_maquinar).
const MATERIALS: { code: string; label: string; value: string }[] = [
  { code: "P", label: "Acero", value: "P-Acero" },
  { code: "M", label: "Inoxidable", value: "M-Inox" },
  { code: "K", label: "Fundición", value: "K-Fundición" },
  { code: "N", label: "No ferrosos", value: "N-No ferrosos" },
  { code: "S", label: "Superaleaciones", value: "S-Superaleaciones" },
  { code: "H", label: "Endurecidos", value: "H-Endurecidos" },
];

const FEATURED_BRAND = "Iscar";

// ── Constructores de URL ───────────────────────────────────────────────────
function productosHref(params: Record<string, string>): string {
  return `/productos?${new URLSearchParams(params).toString()}`;
}
const tipoHref = (slug: string, tipo: string) =>
  productosHref(tipo ? { categoria: slug, tipo } : { categoria: slug });
const materialHref = (slug: string, value: string) =>
  productosHref({ categoria: slug, material_a_maquinar: value });
// Mismo formato exacto que el resto del sitio (home-sections BrandBar).
const marcaHref = (name: string) => `/productos?marca=${encodeURIComponent(name)}`;

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
    <ul className={className ?? "space-y-0.5"}>
      {MATERIALS.map((m) => (
        <li key={m.code}>
          <Link
            href={materialHref(slug, m.value)}
            onClick={onNavigate}
            aria-label={`Material a maquinar ${m.code}: ${m.label}`}
            className="flex items-center gap-2 rounded-md px-1.5 py-1 text-sm text-hc-ink transition-colors hover:bg-hc-soft hover:text-hc-navy focus-visible:bg-hc-soft focus-visible:outline-none"
          >
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-hc-navy text-xs font-bold text-white"
              aria-hidden
            >
              {m.code}
            </span>
            <span>{m.label}</span>
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

function WhatsAppPill({ onNavigate }: { onNavigate: Nav }) {
  if (!site.whatsapp) return null;
  const text = encodeURIComponent("Hola, me interesa cotizar herramental para CNC. ");
  return (
    <a
      href={`https://wa.me/${site.whatsapp}?text=${text}`}
      target="_blank"
      rel="noopener noreferrer"
      data-event="contact_whatsapp"
      onClick={onNavigate}
      className="press flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]"
    >
      <WhatsAppIcon className="h-4 w-4" />
      WhatsApp
    </a>
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
  const activeSlug = CATEGORIES[activeIdx]?.slug ?? CATEGORIES[0].slug;

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
    const n = CATEGORIES.length;
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
        className="flex items-center gap-1.5 whitespace-nowrap rounded py-2 font-heading text-sm text-white transition-colors hover:text-hc-sky focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hc-sky"
      >
        <LayoutGrid className="h-4 w-4" aria-hidden />
        Catálogo
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 motion-reduce:transition-none ${
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
              {CATEGORIES.map((c, i) => {
                const isActive = i === activeIdx;
                return (
                  <li key={c.slug}>
                    <Link
                      href={productosHref({ categoria: c.slug })}
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

            {/* Centro: Tipos + Material a maquinar de la categoría activa */}
            <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-2 p-5">
              <div>
                <h3 className="mb-2 font-heading text-[11px] font-semibold uppercase tracking-wide text-hc-gunmetal">
                  Tipos · {CATEGORIES[activeIdx]?.name}
                </h3>
                <TiposLinks slug={activeSlug} onNavigate={() => closeNow(false)} />
              </div>
              <div>
                <h3 className="mb-2 font-heading text-[11px] font-semibold uppercase tracking-wide text-hc-gunmetal">
                  Por material a maquinar
                </h3>
                <MaterialChips slug={activeSlug} onNavigate={() => closeNow(false)} />
              </div>
            </div>

            {/* Panel derecho: marca destacada + CTA + WhatsApp */}
            <div className="w-64 shrink-0 space-y-3 border-l border-hc-metal-light p-5">
              <FeaturedBrandCard onNavigate={() => closeNow(false)} />
              <QuoteCta onNavigate={() => closeNow(false)} />
              <WhatsAppPill onNavigate={() => closeNow(false)} />
            </div>
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
              {CATEGORIES.map((c, i) => {
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
                        <div>
                          <h3 className="mb-1.5 font-heading text-[11px] font-semibold uppercase tracking-wide text-hc-gunmetal">
                            Tipos
                          </h3>
                          <TiposLinks slug={c.slug} onNavigate={() => closeNow(false)} />
                        </div>
                        <div>
                          <h3 className="mb-1.5 font-heading text-[11px] font-semibold uppercase tracking-wide text-hc-gunmetal">
                            Por material a maquinar
                          </h3>
                          <MaterialChips
                            slug={c.slug}
                            onNavigate={() => closeNow(false)}
                            className="grid grid-cols-2 gap-1"
                          />
                        </div>
                        <Link
                          href={productosHref({ categoria: c.slug })}
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

            {/* Marca destacada + CTA + WhatsApp + marcas + ver todo */}
            <div className="space-y-3 p-4">
              <FeaturedBrandCard onNavigate={() => closeNow(false)} />
              <QuoteCta onNavigate={() => closeNow(false)} />
              <WhatsAppPill onNavigate={() => closeNow(false)} />
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
