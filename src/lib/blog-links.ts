// Enlazado recíproco tienda ↔ blog. El blog ya enlaza a los nodos de taxonomía
// (/tipo, /instrumento, /categoria); este mapa hace que esos nodos enlacen DE
// VUELTA a su(s) guía(s) de blog. Cierra el círculo: reparte autoridad de enlace
// en ambos sentidos (topic cluster) y lleva al usuario que investiga hacia la
// ficha/cotización. Se renderiza con <RelatedGuides>.

export type GuideLink = { href: string; title: string };

// Catálogo de guías publicadas (una sola fuente para no repetir títulos/URLs).
const G: Record<string, GuideLink> = {
  brocas: {
    href: "/blog/brocas-para-metal-guia",
    title: "Brocas para metal: cómo elegir la correcta",
  },
  machuelos: {
    href: "/blog/machuelos-para-roscar-guia",
    title: "Machuelos para roscar: guía y tabla broca-machuelo",
  },
  buriles: {
    href: "/blog/buriles-para-torno-guia",
    title: "Buriles para torno: tipos, geometría y usos",
  },
  insertos: {
    href: "/blog/insertos-de-carburo-guia",
    title: "Insertos de carburo: cómo leer el código ISO",
  },
  fresas: {
    href: "/blog/fresas-de-carburo-guia",
    title: "Fresas de carburo (endmills): guía para CNC",
  },
  vernier: {
    href: "/blog/como-leer-calibrador-vernier",
    title: "Cómo leer un calibrador vernier (pie de rey)",
  },
  micrometro: {
    href: "/blog/como-usar-un-micrometro",
    title: "Micrómetro: qué es y cómo leerlo",
  },
  indicador: {
    href: "/blog/como-usar-indicador-de-caratula",
    title: "Indicador de carátula: qué es y cómo usarlo",
  },
  velocidades: {
    href: "/blog/velocidades-y-avances-de-corte",
    title: "Velocidades y avances de corte: tablas por material",
  },
};

// Clave: "<namespace>:<slug>". El namespace es el tipo de nodo.
const RELATED_GUIDES: Record<string, GuideLink[]> = {
  // Tipos de herramienta de corte → su guía específica.
  "tipo:broca": [G.brocas],
  "tipo:machuelo": [G.machuelos],
  "tipo:buril": [G.buriles],
  "tipo:inserto": [G.insertos],
  "tipo:fresa-endmill": [G.fresas],
  "tipo:tarraja": [G.machuelos], // la guía de machuelos cubre tarrajas/roscado

  // Instrumentos de medición → su guía específica.
  "instrumento:calibrador-vernier": [G.vernier],
  "instrumento:micrometro": [G.micrometro],
  "instrumento:indicador": [G.indicador],

  // Categorías (operación) → guía(s) de la operación + el pillar de parámetros.
  "categoria:perforacion": [G.brocas, G.velocidades],
  "categoria:roscado": [G.machuelos, G.velocidades],
  "categoria:torneado": [G.buriles, G.insertos, G.velocidades],
  "categoria:fresado": [G.fresas, G.velocidades],
  "categoria:portaherramientas": [G.insertos],
  "categoria:medicion": [G.vernier, G.micrometro, G.indicador],
};

export function relatedGuides(
  ns: "tipo" | "instrumento" | "categoria",
  slug: string,
): GuideLink[] {
  return RELATED_GUIDES[`${ns}:${slug}`] ?? [];
}
