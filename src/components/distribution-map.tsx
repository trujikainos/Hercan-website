"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Mapa de cobertura nacional (decorativo) para /nosotros.
 *
 * - SVG inline autocontenido: silueta estilizada (low-poly) de México +
 *   Monterrey como hub luminoso + arcos curvos hacia varias ciudades.
 * - Partículas que viajan de Monterrey a cada ciudad vía un ÚNICO loop de
 *   requestAnimationFrame (se detiene por completo fuera de viewport → 0 CPU).
 * - Pulsos/halos con CSS (compositor-friendly), activados solo con la clase
 *   `.dm-run` que se agrega cuando hay movimiento permitido + está a la vista.
 * - `prefers-reduced-motion`: no arranca el rAF y no agrega `.dm-run` →
 *   se muestra el mapa 100% estático (arcos dibujados + nodos fijos).
 *
 * No es cartografía exacta: es una ilustración de distribución. El dato real
 * y verdadero es "envíos a todo México desde Monterrey".
 */

type Pt = { x: number; y: number };
type City = { name: string; x: number; y: number };

// Coordenadas en el espacio del viewBox (1000 x 620), proyección lineal
// aproximada de lon/lat de México → posiciones geográficamente plausibles.
const HUB: City = { name: "Monterrey", x: 552, y: 239 };

const CITIES: City[] = [
  { name: "Tijuana", x: 30, y: 22 },
  { name: "Hermosillo", x: 216, y: 128 },
  { name: "Chihuahua", x: 372, y: 150 },
  { name: "Guadalajara", x: 452, y: 402 },
  { name: "León", x: 510, y: 388 },
  { name: "Ciudad de México", x: 588, y: 445 },
  { name: "Veracruz", x: 682, y: 452 },
  { name: "Mérida", x: 886, y: 388 },
  { name: "Acapulco", x: 566, y: 527 },
];

// Silueta estilizada de México (dos subtrazos: territorio continental + Baja California).
const MEXICO_PATH =
  "M103,13 L219,55 L359,41 L547,140 L578,180 L641,232 L630,351 L684,450 " +
  "L738,485 L792,470 L858,429 L888,382 L973,379 L928,473 L844,553 L805,591 " +
  "L684,566 L566,527 L494,491 L428,455 L399,405 L362,320 L269,241 L222,166 L141,55 Z " +
  "M31,16 L44,38 L72,96 L125,165 L181,228 L253,330 L241,289 L208,228 L179,185 L99,64 L108,22 Z";

/** Punto de control de la cuadrática: eleva el arco (perpendicular hacia "arriba"). */
function control(a: Pt, b: Pt): Pt {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  let nx = -dy;
  let ny = dx;
  if (ny > 0) {
    nx = -nx;
    ny = -ny;
  }
  const k = 0.22;
  return { x: mx + nx * k, y: my + ny * k };
}

type Arc = { d: string; ctrl: Pt; to: Pt };

const ARCS: Arc[] = CITIES.map((c) => {
  const ctrl = control(HUB, c);
  return {
    d: `M${HUB.x},${HUB.y} Q${ctrl.x.toFixed(1)},${ctrl.y.toFixed(1)} ${c.x},${c.y}`,
    ctrl,
    to: { x: c.x, y: c.y },
  };
});

/** Punto sobre la cuadrática Monterrey→ciudad en el parámetro t ∈ [0,1]. */
function quadAt(arc: Arc, t: number): Pt {
  const mt = 1 - t;
  const w0 = mt * mt;
  const w1 = 2 * mt * t;
  const w2 = t * t;
  return {
    x: w0 * HUB.x + w1 * arc.ctrl.x + w2 * arc.to.x,
    y: w0 * HUB.y + w1 * arc.ctrl.y + w2 * arc.to.y,
  };
}

const TRAVEL_MS = 3600; // duración de un recorrido completo de la partícula

export function DistributionMap() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const particleRefs = useRef<(SVGGElement | null)[]>([]);
  const [motionOK, setMotionOK] = useState(false);
  const [inView, setInView] = useState(false);

  // Respetar prefers-reduced-motion (y reaccionar si el usuario lo cambia).
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setMotionOK(!mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  // Solo animar cuando el mapa está a la vista (ahorra trabajo fuera de pantalla).
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) setInView(e.isIntersecting);
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const running = motionOK && inView;

  // Loop único de rAF que mueve una partícula por cada arco.
  useEffect(() => {
    const groups = particleRefs.current;
    if (!running) {
      groups.forEach((g) => g?.setAttribute("opacity", "0"));
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const loop = (now: number) => {
      const elapsed = now - t0;
      for (let i = 0; i < ARCS.length; i++) {
        const g = groups[i];
        if (!g) continue;
        const phase = (elapsed / TRAVEL_MS + i * 0.11) % 1;
        const p = quadAt(ARCS[i], phase);
        g.setAttribute("transform", `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
        // Emerge en Monterrey y se desvanece al llegar (flujo saliente).
        g.setAttribute("opacity", Math.sin(Math.PI * phase).toFixed(3));
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      groups.forEach((g) => g?.setAttribute("opacity", "0"));
    };
  }, [running]);

  return (
    <div
      ref={wrapRef}
      className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl ring-1 ring-white/10"
    >
      <span className="sr-only">
        Ilustración: mapa de México con Monterrey como punto de origen y líneas de
        envío hacia varias ciudades del país. HERCAN realiza envíos a todo México
        desde su sede en Monterrey.
      </span>

      {/* Estilos locales namespaced (dm-*) para no tocar globals.css. */}
      <style>{`
        .dm-node { transform-box: fill-box; transform-origin: center; }
        .dm-ping { opacity: 0; }
        .dm-run .dm-ping { animation: dmPing 3.1s var(--ease-in-out-brand, ease-in-out) infinite; }
        .dm-run .dm-hub-ping { animation: dmPing 3.4s var(--ease-in-out-brand, ease-in-out) infinite; }
        .dm-run .dm-core { animation: dmCore 2.8s ease-in-out infinite; }
        @keyframes dmPing {
          0% { transform: scale(0.45); opacity: 0.55; }
          75% { opacity: 0; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes dmCore {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
      `}</style>

      <svg
        viewBox="0 0 1000 620"
        aria-hidden="true"
        focusable="false"
        preserveAspectRatio="xMidYMid meet"
        className={`pointer-events-none block h-auto w-full ${running ? "dm-run" : ""}`}
      >
        <defs>
          <radialGradient id="dmBg" cx="55%" cy="40%" r="80%">
            <stop offset="0%" stopColor="#13456a" />
            <stop offset="100%" stopColor="#071f30" />
          </radialGradient>
          <linearGradient id="dmLand" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1c5a86" />
            <stop offset="100%" stopColor="#123f5f" />
          </linearGradient>
          <linearGradient id="dmArc" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2083a3" />
            <stop offset="55%" stopColor="#5e9cc1" />
            <stop offset="100%" stopColor="#bfe3f4" />
          </linearGradient>
          <radialGradient id="dmHub" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#bfe6fb" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#bfe6fb" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="dmParticle" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#eaf6fc" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#7cc4e6" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Fondo con profundidad (glow radial centrado cerca de Monterrey) */}
        <rect x="0" y="0" width="1000" height="620" fill="url(#dmBg)" />

        {/* Silueta de México */}
        <path
          d={MEXICO_PATH}
          fill="url(#dmLand)"
          fillOpacity={0.55}
          stroke="#4f86ab"
          strokeOpacity={0.5}
          strokeWidth={1.2}
          strokeLinejoin="round"
        />

        {/* Anillos de origen (estáticos, sutiles) */}
        <circle cx={HUB.x} cy={HUB.y} r={58} fill="none" stroke="#7cc4e6" strokeOpacity={0.08} />
        <circle cx={HUB.x} cy={HUB.y} r={112} fill="none" stroke="#7cc4e6" strokeOpacity={0.06} />

        {/* Arcos: trazo ancho translúcido (glow) + trazo fino brillante */}
        {ARCS.map((arc, i) => (
          <g key={`arc-${i}`}>
            <path
              d={arc.d}
              fill="none"
              stroke="url(#dmArc)"
              strokeWidth={5}
              strokeOpacity={0.1}
              strokeLinecap="round"
            />
            <path
              d={arc.d}
              fill="none"
              stroke="url(#dmArc)"
              strokeWidth={1.4}
              strokeOpacity={0.75}
              strokeLinecap="round"
            />
          </g>
        ))}

        {/* Nodos de ciudad: halo que late + punto */}
        {CITIES.map((c, i) => (
          <g key={c.name} transform={`translate(${c.x} ${c.y})`}>
            <circle
              className="dm-node dm-ping"
              r={5}
              fill="none"
              stroke="#7cc4e6"
              strokeWidth={1.4}
              style={{ animationDelay: `${(-i * 0.43).toFixed(2)}s` }}
            />
            <circle
              className="dm-node dm-core"
              r={3}
              fill="#bfe3f4"
              style={{ animationDelay: `${(-i * 0.31).toFixed(2)}s` }}
            />
            <circle r={1.3} fill="#eaf6fc" />
          </g>
        ))}

        {/* Partículas (una por arco), posicionadas por rAF vía transform */}
        {ARCS.map((_, i) => (
          <g
            key={`p-${i}`}
            ref={(el) => {
              particleRefs.current[i] = el;
            }}
            opacity={0}
          >
            <circle r={7} fill="url(#dmParticle)" />
            <circle r={2.3} fill="#f2fafe" />
          </g>
        ))}

        {/* Hub: Monterrey (destacado) */}
        <g transform={`translate(${HUB.x} ${HUB.y})`}>
          <circle className="dm-node dm-hub-ping" r={10} fill="none" stroke="#8fd0ef" strokeWidth={1.6} />
          <circle
            className="dm-node dm-hub-ping"
            r={10}
            fill="none"
            stroke="#8fd0ef"
            strokeWidth={1.6}
            style={{ animationDelay: "-1.6s" }}
          />
          <circle r={13} fill="url(#dmHub)" />
          <circle r={5} fill="#eaf6fc" />
          <circle r={2.2} fill="#2083a3" />
          <text
            x={0}
            y={-18}
            textAnchor="middle"
            stroke="#07202f"
            strokeWidth={3}
            paintOrder="stroke"
            style={{
              fontSize: 16,
              fontWeight: 600,
              letterSpacing: 0.4,
              fill: "#dbeef9",
              fontFamily: "var(--font-oswald), system-ui, sans-serif",
            }}
          >
            Monterrey
          </text>
        </g>
      </svg>
    </div>
  );
}
