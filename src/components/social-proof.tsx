"use client";

import { useEffect, useRef, useState } from "react";
import { Eye, FileText, ShoppingBag, X } from "lucide-react";
import { SOCIAL_PROOF_ENABLED, makeEvent, eventKey, type SocialEvent } from "@/lib/social-proof";

// Ritmo (ms). Ajustable sin tocar la lógica.
const INITIAL_DELAY = 6000; // espera antes del primer toast
const VISIBLE_MS = 6000; // cuánto se queda visible
const GAP_MIN = 22000; // pausa mínima entre toasts
const GAP_MAX = 45000; // pausa máxima
const MAX_PER_SESSION = 6; // tope por sesión (anti-spam)

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
  const shown = useRef(0);
  const used = useRef<Set<string>>(new Set()); // firmas ya mostradas → sin repeticiones

  useEffect(() => {
    if (!SOCIAL_PROOF_ENABLED || dismissed) return;
    // Continúa el conteo dentro de la sesión (no reinicia el tope al navegar).
    shown.current = Number(sessionStorage.getItem("hc_sp_count") || "0");

    const clearAll = () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
    const at = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));

    const cycle = () => {
      if (shown.current >= MAX_PER_SESSION) return;
      const e = makeEvent(used.current);
      used.current.add(eventKey(e));
      setEvent(e);
      setVisible(true);
      shown.current += 1;
      sessionStorage.setItem("hc_sp_count", String(shown.current));
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
      className={`fixed bottom-4 left-4 z-40 w-[19rem] max-w-[calc(100vw-2rem)] transition-all duration-500 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <div className="flex items-start gap-3 rounded-xl border border-hc-metal-light bg-white p-3 shadow-lg shadow-hc-navy/10">
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
      </div>
    </div>
  );
}
