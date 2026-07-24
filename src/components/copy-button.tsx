"use client";

import { useState, useRef, useEffect } from "react";
import { Check, Copy } from "lucide-react";

/** Copia un valor al portapapeles (p. ej. el N° de parte para pegarlo en una OC). */
export function CopyButton({
  value,
  label,
  small = false,
}: {
  value: string;
  label?: string;
  small?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (copiedTimer.current) clearTimeout(copiedTimer.current); }, []);
  const size = small ? "h-3 w-3" : "h-3.5 w-3.5";

  async function copy(e: React.MouseEvent) {
    // Si el botón vive dentro de (o junto a) un Link, evita navegar al copiar.
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard no disponible (http/permiso) — se ignora en silencio */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copiar ${label ?? value}`}
      title={copied ? "¡Copiado!" : "Copiar"}
      className="press inline-flex items-center rounded p-1 text-hc-steel transition-colors hover:text-hc-blue"
    >
      {copied ? (
        <Check className={`${size} text-[#2e7d46]`} aria-hidden />
      ) : (
        <Copy className={size} aria-hidden />
      )}
    </button>
  );
}
