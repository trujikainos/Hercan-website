"use client";

import { useRef, useState } from "react";

type SpecGroup = { group: string; items: { label: string; value: string }[] };

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-");

/**
 * Pestañas de especificaciones, dependientes del producto: una por cada grupo
 * con datos. "General" va siempre primera y activa por defecto. Los grupos
 * vacíos no generan pestaña (p. ej. un instrumento no muestra "Corte").
 * La descripción va aparte, siempre visible, fuera de este componente.
 */
export function ProductTabs({ specGroups }: { specGroups: SpecGroup[] }) {
  const tabs = specGroups.map((g) => ({ id: slug(g.group), label: g.group, group: g }));
  const [active, setActive] = useState(tabs[0]?.id);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const currentId = tabs.some((t) => t.id === active) ? active : tabs[0]?.id;

  function onKeyDown(e: React.KeyboardEvent, i: number) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next =
      e.key === "ArrowRight" ? (i + 1) % tabs.length : (i - 1 + tabs.length) % tabs.length;
    setActive(tabs[next].id);
    tabRefs.current[next]?.focus();
  }

  if (tabs.length === 0) return null;

  return (
    <div>
      <div
        role="tablist"
        aria-label="Especificaciones del producto"
        className="flex gap-1 overflow-x-auto border-b border-hc-metal-light [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {tabs.map((t, i) => {
          const on = t.id === currentId;
          return (
            <button
              key={t.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={on}
              aria-controls={`panel-${t.id}`}
              tabIndex={on ? 0 : -1}
              onClick={() => setActive(t.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`-mb-px shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                on
                  ? "border-hc-blue text-hc-navy"
                  : "border-transparent text-hc-gunmetal hover:text-hc-ink"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tabs.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`panel-${t.id}`}
          aria-labelledby={`tab-${t.id}`}
          hidden={t.id !== currentId}
          className="pt-5"
        >
          {/* Ocupa todo el ancho de la columna: 2 columnas en desktop */}
          <dl className="grid gap-x-12 text-sm sm:grid-cols-2">
            {t.group.items.map((it) => (
              <div
                key={it.label}
                className="flex items-baseline justify-between gap-4 border-b border-hc-metal-light py-2"
              >
                <dt className="text-hc-gunmetal">{it.label}</dt>
                <dd className="text-right font-medium text-hc-ink">{it.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}
