"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Observa todos los elementos .reveal y les agrega .is-visible al entrar en viewport.
 * - Re-escanea en cada navegación (usePathname).
 * - Respeta prefers-reduced-motion (revela todo de inmediato).
 * - Salvaguarda de liveness: si en 2.5s no dispararon (headless/bots sin scroll),
 *   revela todo para no dejar contenido invisible.
 */
export function RevealController() {
  const pathname = usePathname();

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal:not(.is-visible)"));
    if (els.length === 0) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      els.forEach((e) => e.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    els.forEach((e) => io.observe(e));

    const safety = window.setTimeout(() => {
      els.forEach((e) => e.classList.add("is-visible"));
    }, 2500);

    return () => {
      io.disconnect();
      window.clearTimeout(safety);
    };
  }, [pathname]);

  return null;
}
