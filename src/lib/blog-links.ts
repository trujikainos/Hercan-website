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
  avellanadores: {
    href: "/blog/avellanadores-guia",
    title: "Avellanador: qué es, tipos y tabla de ángulos",
  },
  tarrajas: {
    href: "/blog/tarrajas-para-roscar-guia",
    title: "Tarrajas para roscar: tipos, uso y medidas",
  },
  carburo: {
    href: "/blog/carburo-de-tungsteno-que-es",
    title: "Carburo de tungsteno: qué es y por qué corta",
  },
  discos: {
    href: "/blog/discos-de-corte-guia",
    title: "Discos de corte: tipos, grosor y RPM máxima",
  },
};

// Clave: "<namespace>:<slug>". El namespace es el tipo de nodo.
const RELATED_GUIDES: Record<string, GuideLink[]> = {
  // Tipos de herramienta de corte → su guía específica.
  "tipo:broca": [G.brocas],
  "tipo:machuelo": [G.machuelos],
  "tipo:buril": [G.buriles],
  "tipo:inserto": [G.insertos, G.carburo], // insertos son de carburo
  "tipo:fresa-endmill": [G.fresas, G.carburo], // endmills de carburo
  "tipo:tarraja": [G.tarrajas, G.machuelos], // guía propia (rosca exterior) + machuelos (rosca interior)
  "tipo:avellanador": [G.avellanadores],

  // Instrumentos de medición → su guía específica.
  "instrumento:calibrador-vernier": [G.vernier],
  "instrumento:micrometro": [G.micrometro],
  "instrumento:indicador": [G.indicador],

  // Categorías (operación) → guía(s) de la operación + el pillar de parámetros.
  "categoria:perforacion": [G.brocas, G.avellanadores, G.velocidades],
  "categoria:roscado": [G.machuelos, G.tarrajas, G.velocidades],
  "categoria:torneado": [G.buriles, G.insertos, G.velocidades],
  "categoria:fresado": [G.fresas, G.velocidades],
  "categoria:portaherramientas": [G.insertos],
  "categoria:abrasivos": [G.discos],
  "categoria:medicion": [G.vernier, G.micrometro, G.indicador],
};

export function relatedGuides(
  ns: "tipo" | "instrumento" | "categoria",
  slug: string,
): GuideLink[] {
  return RELATED_GUIDES[`${ns}:${slug}`] ?? [];
}

/**
 * Sentido inverso: de cada guía a SU página de tienda, con el término exacto que
 * esa página debe ganar. Existe porque Google ponía la guía en lugar de la tienda
 * para "micrómetro" y "tarraja" (tracking nov 2026): el enlace visible arriba de la
 * guía, con ese texto, le dice cuál es la página de compra.
 */
const STORE_FOR_GUIDE: Record<string, { href: string; termino: string; art: "los" | "las" }> = {
  "brocas-para-metal-guia": { href: "/tipo/broca", termino: "brocas para metal", art: "las" },
  "machuelos-para-roscar-guia": { href: "/tipo/machuelo", termino: "machuelos", art: "los" },
  "buriles-para-torno-guia": { href: "/tipo/buril", termino: "buriles para torno", art: "los" },
  "insertos-de-carburo-guia": { href: "/tipo/inserto", termino: "insertos de carburo", art: "los" },
  "fresas-de-carburo-guia": { href: "/tipo/fresa-endmill", termino: "fresas de carburo", art: "las" },
  "como-leer-calibrador-vernier": { href: "/instrumento/calibrador-vernier", termino: "vernier y calibradores", art: "los" },
  "como-usar-un-micrometro": { href: "/instrumento/micrometro", termino: "micrómetros", art: "los" },
  "como-usar-indicador-de-caratula": { href: "/instrumento/indicador", termino: "indicadores de carátula", art: "los" },
  "avellanadores-guia": { href: "/tipo/avellanador", termino: "avellanadores", art: "los" },
  "tarrajas-para-roscar-guia": { href: "/tipo/tarraja", termino: "tarrajas", art: "las" },
  "carburo-de-tungsteno-que-es": { href: "/material/carburo", termino: "herramientas de carburo", art: "las" },
  "discos-de-corte-guia": { href: "/categoria/abrasivos", termino: "discos de corte", art: "los" },
  "velocidades-y-avances-de-corte": { href: "/tipos", termino: "herramientas de corte", art: "las" },
};

export function storeForGuide(handle: string): { href: string; termino: string; art: "los" | "las" } | null {
  return STORE_FOR_GUIDE[handle] ?? null;
}
