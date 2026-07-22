"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Mapa de partículas de México (decorativo) para el hero de /nosotros.
 *
 * - México se forma con una NUBE de puntos pequeños (stipple / point-cloud):
 *   contorno denso + relleno disperso muestreado DENTRO de la silueta.
 * - Monterrey = hub brillante dentro de la nube, con arcos sutiles y partículas
 *   que viajan hacia algunas ciudades (idea de distribución, secundario).
 * - Motion: la nube es estática; solo late el hub, unos nodos y unos pocos
 *   puntos ("twinkle") con CSS, más las partículas por un ÚNICO rAF. Todo se
 *   desactiva con `prefers-reduced-motion` (versión estática) y fuera de viewport.
 *
 * No es cartografía exacta: es una ilustración. El dato verdadero es
 * "envíos a todo México desde Monterrey".
 */

type Pt = { x: number; y: number };

// PRNG con semilla fija → la nube es idéntica en servidor y cliente (sin
// desajuste de hidratación).
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Silueta estilizada de México en el espacio del viewBox (1000 x 620):
// territorio continental + Baja California (proyección lon/lat aproximada).
const MAINLAND: Pt[] = [
  [103, 13], [219, 55], [359, 41], [547, 140], [578, 180], [641, 232],
  [630, 351], [684, 450], [738, 485], [792, 470], [858, 429], [888, 382],
  [973, 379], [928, 473], [844, 553], [805, 591], [684, 566], [566, 527],
  [494, 491], [428, 455], [399, 405], [362, 320], [269, 241], [222, 166], [141, 55],
].map(([x, y]) => ({ x, y }));

const BAJA: Pt[] = [
  [31, 16], [44, 38], [72, 96], [125, 165], [181, 228], [253, 330],
  [241, 289], [208, 228], [179, 185], [99, 64], [108, 22],
].map(([x, y]) => ({ x, y }));

function pointInPoly(x: number, y: number, poly: Pt[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, yi = poly[i].y, xj = poly[j].x, yj = poly[j].y;
    const hit = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (hit) inside = !inside;
  }
  return inside;
}
const inMexico = (x: number, y: number) =>
  pointInPoly(x, y, MAINLAND) || pointInPoly(x, y, BAJA);

// c: 0 = borde (brillante), 1 = polvo (medio), 2 = tenue.
type Dot = { x: number; y: number; c: 0 | 1 | 2; r: number; tw: boolean; d: number };

function buildCloud(): Dot[] {
  const rand = mulberry32(20240722);
  const dots: Dot[] = [];

  const addContour = (poly: Pt[], step: number) => {
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i];
      const b = poly[(i + 1) % poly.length];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy);
      const n = Math.max(1, Math.round(len / step));
      for (let k = 0; k < n; k++) {
        const t = k / n;
        const x = a.x + dx * t + (rand() - 0.5) * 2;
        const y = a.y + dy * t + (rand() - 0.5) * 2;
        const c: 0 | 1 = rand() < 0.8 ? 0 : 1;
        const r = 0.9 + rand() * 0.9;
        const tw = rand() < 0.09;
        const d = rand() * 4;
        dots.push({ x: +x.toFixed(1), y: +y.toFixed(1), c, r: +r.toFixed(1), tw, d: +d.toFixed(2) });
      }
    }
  };
  addContour(MAINLAND, 11);
  addContour(BAJA, 10);

  for (let y = 13; y <= 591; y += 22) {
    for (let x = 30; x <= 973; x += 22) {
      if (rand() > 0.6) continue;
      const jx = x + (rand() - 0.5) * 22;
      const jy = y + (rand() - 0.5) * 22;
      const c: 1 | 2 = rand() < 0.55 ? 1 : 2;
      const r = 0.7 + rand() * 0.7;
      if (!inMexico(jx, jy)) continue;
      dots.push({ x: +jx.toFixed(1), y: +jy.toFixed(1), c, r: +r.toFixed(1), tw: false, d: 0 });
    }
  }
  return dots;
}

const CLOUD = buildCloud();
const CLS = ["dm-edge", "dm-dust", "dm-dim"] as const;

// --- Distribución: hub + enlaces a algunas ciudades (secundario) ---
const HUB: Pt = { x: 552, y: 239 };
const LINKS: { name: string; x: number; y: number }[] = [
  { name: "Tijuana", x: 30, y: 22 },
  { name: "Chihuahua", x: 372, y: 150 },
  { name: "Guadalajara", x: 452, y: 402 },
  { name: "Ciudad de México", x: 588, y: 445 },
  { name: "Acapulco", x: 566, y: 527 },
  { name: "Mérida", x: 886, y: 388 },
];

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
const ARCS: Arc[] = LINKS.map((c) => {
  const ctrl = control(HUB, c);
  return {
    d: `M${HUB.x},${HUB.y} Q${ctrl.x.toFixed(1)},${ctrl.y.toFixed(1)} ${c.x},${c.y}`,
    ctrl,
    to: { x: c.x, y: c.y },
  };
});

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

const TRAVEL_MS = 4200;

export function DistributionMap() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const particleRefs = useRef<(SVGGElement | null)[]>([]);
  const [motionOK, setMotionOK] = useState(false);
  const [inView, setInView] = useState(false);

  // Respetar prefers-reduced-motion (y reaccionar a cambios en vivo).
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setMotionOK(!mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  // Animar solo cuando el mapa está a la vista.
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
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const running = motionOK && inView;

  // Loop único de rAF: una partícula por arco (0 CPU fuera de viewport).
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
        const phase = (elapsed / TRAVEL_MS + i * 0.16) % 1;
        const p = quadAt(ARCS[i], phase);
        g.setAttribute("transform", `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
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
    <div ref={wrapRef} className="relative w-full">
      <span className="sr-only">
        Ilustración: mapa de México formado por partículas, con Monterrey como
        punto de origen y líneas de envío hacia varias ciudades del país. HERCAN
        realiza envíos a todo México desde su sede en Monterrey.
      </span>

      {/* Estilos locales namespaced (dm-*) para no tocar globals.css. */}
      <style>{`
        .dm-edge { fill: #bfe1f4; opacity: 0.82; }
        .dm-dust { fill: #6fa7cb; opacity: 0.5; }
        .dm-dim  { fill: #4d86ad; opacity: 0.34; }
        .dm-node { transform-box: fill-box; transform-origin: center; }
        .dm-ping { opacity: 0; }
        .dm-run .dm-tw { animation: dmTw 3.6s ease-in-out infinite; }
        .dm-run .dm-ping { animation: dmPing 3.2s var(--ease-in-out-brand, ease-in-out) infinite; }
        .dm-run .dm-hub-ping { animation: dmPing 3.6s var(--ease-in-out-brand, ease-in-out) infinite; }
        .dm-run .dm-core { animation: dmCore 2.8s ease-in-out infinite; }
        @keyframes dmTw { 0%, 100% { opacity: 0.9; } 50% { opacity: 0.28; } }
        @keyframes dmPing {
          0% { transform: scale(0.4); opacity: 0.5; }
          75% { opacity: 0; }
          100% { transform: scale(2.6); opacity: 0; }
        }
        @keyframes dmCore { 0%, 100% { opacity: 0.8; } 50% { opacity: 1; } }
      `}</style>

      <svg
        viewBox="0 0 1000 620"
        aria-hidden="true"
        focusable="false"
        preserveAspectRatio="xMidYMid meet"
        className={`pointer-events-none block h-auto w-full ${running ? "dm-run" : ""}`}
      >
        <defs>
          <radialGradient id="dmGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#5e9cc1" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#5e9cc1" stopOpacity="0" />
          </radialGradient>
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

        {/* Glow suave para que la nube "flote" sobre el navy del hero */}
        <ellipse cx="558" cy="300" rx="520" ry="350" fill="url(#dmGlow)" />

        {/* Nube de partículas que forma México */}
        <g>
          {CLOUD.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={p.r}
              className={p.tw ? `${CLS[p.c]} dm-tw` : CLS[p.c]}
              style={p.tw ? { animationDelay: `${-p.d}s` } : undefined}
            />
          ))}
        </g>

        {/* Arcos de distribución (sutiles): glow ancho + trazo fino */}
        {ARCS.map((arc, i) => (
          <g key={`arc-${i}`}>
            <path d={arc.d} fill="none" stroke="url(#dmArc)" strokeWidth={4} strokeOpacity={0.07} strokeLinecap="round" />
            <path d={arc.d} fill="none" stroke="url(#dmArc)" strokeWidth={1} strokeOpacity={0.32} strokeLinecap="round" />
          </g>
        ))}

        {/* Nodos de ciudad enlazada: halo que late + punto */}
        {LINKS.map((c, i) => (
          <g key={c.name} transform={`translate(${c.x} ${c.y})`}>
            <circle
              className="dm-node dm-ping"
              r={4.5}
              fill="none"
              stroke="#7cc4e6"
              strokeWidth={1.3}
              style={{ animationDelay: `${(-i * 0.5).toFixed(2)}s` }}
            />
            <circle
              className="dm-node dm-core"
              r={2.6}
              fill="#cfe8f7"
              style={{ animationDelay: `${(-i * 0.33).toFixed(2)}s` }}
            />
            <circle r={1.2} fill="#eaf6fc" />
          </g>
        ))}

        {/* Partículas (una por arco), posicionadas por rAF */}
        {ARCS.map((_, i) => (
          <g
            key={`p-${i}`}
            ref={(el) => {
              particleRefs.current[i] = el;
            }}
            opacity={0}
          >
            <circle r={6} fill="url(#dmParticle)" />
            <circle r={2.1} fill="#f2fafe" />
          </g>
        ))}

        {/* Hub: Monterrey (destacado) */}
        <g transform={`translate(${HUB.x} ${HUB.y})`}>
          <circle className="dm-node dm-hub-ping" r={9} fill="none" stroke="#8fd0ef" strokeWidth={1.6} />
          <circle
            className="dm-node dm-hub-ping"
            r={9}
            fill="none"
            stroke="#8fd0ef"
            strokeWidth={1.6}
            style={{ animationDelay: "-1.8s" }}
          />
          <circle r={13} fill="url(#dmHub)" />
          <circle r={5} fill="#eaf6fc" />
          <circle r={2.2} fill="#2083a3" />
          <text
            x={0}
            y={-18}
            textAnchor="middle"
            stroke="#0a2f49"
            strokeWidth={3}
            paintOrder="stroke"
            style={{
              fontSize: 17,
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
