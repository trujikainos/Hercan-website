"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

/**
 * Fondo del hero: rota 4 imágenes (fresado, CNC, medición, torneado) con
 * cross-fade suave. Decorativo (aria-hidden, alt=""): el <h1> ya describe.
 * - priority en la 1ª imagen para no penalizar el LCP.
 * - object-cover object-center: conserva el tercio izquierdo oscuro para el texto.
 * - Respeta prefers-reduced-motion: se queda fijo en la 1ª imagen.
 */
const SLIDES = [
  "/hero/hero-fresado.webp",
  "/hero/hero-cnc.webp",
  "/hero/hero-medicion.webp",
  "/hero/hero-torneado.webp",
];

const INTERVAL_MS = 4000;

export function HeroCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(
      () => setActive((prev) => (prev + 1) % SLIDES.length),
      INTERVAL_MS,
    );
    return () => window.clearInterval(id);
  }, []);

  return (
    <div aria-hidden className="absolute inset-0">
      {SLIDES.map((src, idx) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          priority={idx === 0}
          loading={idx === 0 ? undefined : "eager"}
          sizes="100vw"
          className={`object-cover object-center transition-opacity duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            idx === active ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </div>
  );
}
