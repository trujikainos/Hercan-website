"use client";

import { useEffect } from "react";
import {
  ORIGEN_COOKIE,
  ORIGEN_MAX_AGE,
  actualizar,
  clasificar,
  escribirOrigen,
  leerOrigen,
} from "@/lib/origen";

/**
 * Registra de dónde llegó el visitante (ver lib/origen.ts). Corre una vez por
 * carga de página completa (al montar el layout); la navegación interna no lo
 * vuelve a disparar. No pinta nada y no guarda datos personales.
 */
export function OrigenVisita() {
  useEffect(() => {
    try {
      const raw = document.cookie
        .split("; ")
        .find((c) => c.startsWith(`${ORIGEN_COOKIE}=`))
        ?.slice(ORIGEN_COOKIE.length + 1);
      const prev = leerOrigen(raw);
      const toque = clasificar(
        document.referrer,
        new URLSearchParams(window.location.search),
        window.location.pathname,
        new Date().toISOString().slice(0, 10),
      );
      const next = actualizar(prev, toque);
      if (!next || JSON.stringify(next) === JSON.stringify(prev)) return;
      const secure = window.location.protocol === "https:" ? "; Secure" : "";
      document.cookie = `${ORIGEN_COOKIE}=${escribirOrigen(next)}; Path=/; Max-Age=${ORIGEN_MAX_AGE}; SameSite=Lax${secure}`;
    } catch {
      // Nunca rompe la página: sin cookie, el pedido sale con origen "sin-dato".
    }
  }, []);
  return null;
}
