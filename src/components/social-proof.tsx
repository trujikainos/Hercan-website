"use client";

import { useEffect, useRef, useState } from "react";
import { Eye, FileText, ShoppingBag, X } from "lucide-react";
import { SOCIAL_PROOF_ENABLED, makeEvent, eventKey, type SocialEvent } from "@/lib/social-proof";

// Ritmo (ms). Ajustable sin tocar la lógica.
const INITIAL_DELAY = 6000; // espera antes del primer toast
const VISIBLE_MS = 6000; // cuánto se queda visible
const GAP_MIN = 21000; // pausa mínima entre toasts
const GAP_MAX = 111000; // pausa máxima
const NO_REPEAT_WINDOW = 15; // no repetir dentro de los últimos N eventos

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

function content(e: SocialEvent) {
  if (e.kind === "viendo") {
    return {
      Icon: Eye,
      title: `${e.viewers} personas`,
      body: `viendo ${e.category} ahora`,
      meta: "en vivo",
      live: true,
    };
  }
  return {
    Icon: e.kind === "compra" ? ShoppingBag : FileText,
    title: `${e.name} · ${e.city}`,
    body: e.kind === "compra" ? `Compró ${e.product}` : `Solicitó cotización de ${e.product}`,
    meta: `hace ${e.minutesAgo} min`,
    live: false,
  };
}

export function SocialProof() {
  const [event, setEvent] = useState<SocialEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const recent = useRef<string[]>([]); // firmas recientes → sin repeticiones en la ventana

  useEffect(() => {
    if (!SOCIAL_PROOF_ENABLED || dismissed) return;

    const clearAll = () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
    const at = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));

    // Loop infinito mientras el visitante siga en el sitio; sin repetir dentro de la
    // ventana reciente (para que no se noten los ficticios) pero sin tope total.
    const cycle = () => {
      const e = makeEvent(new Set(recent.current));
      recent.current.push(eventKey(e));
      if (recent.current.length > NO_REPEAT_WINDOW) recent.current.shift();
      setEvent(e);
      setVisible(true);
      at(VISIBLE_MS, () => {
        setVisible(false);
        at(rand(GAP_MIN, GAP_MAX), cycle);
      });
    };

    at(INITIAL_DELAY, cycle);
    return clearAll;
  }, [dismissed]);

  if (!SOCIAL_PROOF_ENABLED || dismissed || !event) return null;
  const c = content(event);
  const { Icon } = c;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-4 left-4 z-40 w-[19rem] max-w-[calc(100vw-2rem)] will-change-transform transition-[transform,opacity] ${
        visible
          ? "translate-x-0 translate-y-0 scale-100 opacity-100 duration-[450ms] ease-[cubic-bezier(.34,1.56,.64,1)]"
          : "pointer-events-none -translate-x-3 translate-y-4 scale-95 opacity-0 duration-200 ease-[cubic-bezier(.4,0,1,1)]"
      }`}
    >
      <div className="relative flex items-start gap-3 overflow-hidden rounded-xl border border-hc-metal-light bg-white p-3 shadow-xl shadow-hc-navy/15 ring-1 ring-black/[0.02]">
        <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-hc-navy to-hc-steel text-white">
          <Icon className="h-5 w-5" aria-hidden />
          {c.live && (
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-pulse rounded-full bg-green-500 ring-2 ring-white" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-hc-navy">{c.title}</p>
          <p className="truncate text-xs text-hc-ink">{c.body}</p>
          <p className="mt-0.5 text-[11px] text-hc-metal">{c.meta} · Hercan</p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Cerrar notificación"
          className="shrink-0 text-hc-metal transition-colors hover:text-hc-gunmetal"
        >
          <X className="h-4 w-4" />
        </button>
        {/* Barra de progreso del auto-cierre (se remonta con cada evento → reinicia). */}
        {visible && (
          <span
            key={eventKey(event)}
            className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-hc-steel/70"
            style={{
              animationName: "spProgress",
              animationDuration: `${VISIBLE_MS}ms`,
              animationTimingFunction: "linear",
              animationFillMode: "forwards",
            }}
          />
        )}
      </div>
    </div>
  );
}
