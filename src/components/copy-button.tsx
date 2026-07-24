"use client";

import { useState, useRef, useEffect } from "react";
import { Check, Copy } from "lucide-react";

/**
 * Copia un valor al portapapeles (p. ej. el N° de parte para pegarlo en una OC).
 * Al copiar, la palomita + "¡Copiado!" ENTRA con un pop, se MANTIENE ~1.8 s y
 * luego SALE con una animación antes de volver al ícono normal (3 fases:
 * idle → in → out). Respeta prefers-reduced-motion vía globals.
 */
export function CopyButton({
  value,
  label,
  small = false,
}: {
  value: string;
  label?: string;
  small?: boolean;
}) {
  const [phase, setPhase] = useState<"idle" | "in" | "out">("idle");
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const outTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const size = small ? "h-3 w-3" : "h-3.5 w-3.5";

  const clearTimers = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    if (outTimer.current) clearTimeout(outTimer.current);
  };
  useEffect(() => clearTimers, []);

  async function copy(e: React.MouseEvent) {
    // Si el botón vive dentro de (o junto a) un Link, evita navegar al copiar.
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      /* clipboard no disponible (http/permiso) — se ignora en silencio */
      return;
    }
    clearTimers();
    setPhase("in");
    // Se mantiene ~1.8 s, luego dispara la salida y regresa a idle al terminarla.
    holdTimer.current = setTimeout(() => {
      setPhase("out");
      outTimer.current = setTimeout(() => setPhase("idle"), 260);
    }, 1800);
  }

  const copied = phase !== "idle";
  // Clases literales completas (Tailwind no detecta interpolación dinámica).
  const anim =
    phase === "in"
      ? "motion-safe:animate-[copyPop_0.26s_ease-out] motion-safe:[animation-fill-mode:both]"
      : "motion-safe:animate-[copyOut_0.26s_ease-out] motion-safe:[animation-fill-mode:both]";
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copiar ${label ?? value}`}
      title={copied ? "¡Copiado!" : "Copiar"}
      className="press inline-flex items-center gap-1 rounded p-1 text-hc-steel transition-colors hover:text-hc-blue"
    >
      {copied ? (
        <>
          <Check className={`${size} text-[#2e7d46]`} aria-hidden />
          <span className={`text-[10px] font-semibold text-[#2e7d46] ${anim}`}>
            ¡Copiado!
          </span>
        </>
      ) : (
        <Copy className={size} aria-hidden />
      )}
    </button>
  );
}
