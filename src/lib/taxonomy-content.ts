/**
 * Contenido informativo de las páginas de taxonomía (marca y categoría).
 * Se usa para el hero citable (AEO/GEO), el <title>/description y el schema.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * REGLA DE CONTENIDO: solo hechos ORIGINALES y AMPLIAMENTE VERIFICABLES. Nada
 * inventado, nada copiado del marketing de las marcas. Las intros de MARCA se
 * enfocan en "qué distribuye HERCAN de esta marca" + datos generales del
 * fabricante que son de dominio público (país/tipo de fabricante). Las intros de
 * CATEGORÍA son conocimiento general de maquinado (factual).
 *
 * ⚠️ PENDIENTE DE REVISIÓN / APROBACIÓN (Carlos):
 *   - "titanium" y "kta": marcas de las que NO tengo datos verificables. La intro
 *     es genérica a propósito (no afirma país, tipo ni línea). Ver `needsReview`.
 *     Confirmar con Hercan qué son y ampliar antes de salir a producción.
 *   - Verificar además el resto de datos de fabricante con el cliente si se van a
 *     indexar (nacionalidades/grupo corporativo son de dominio público, pero
 *     conviene el visto bueno de Armando).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { Faq } from "./faq";

export type BrandContent = {
  /** Valor REAL de la marca (vendor) usado como scope del catálogo. */
  name: string;
  /** H1 del hero. */
  title: string;
  metaTitle: string;
  metaDescription: string;
  /** Párrafos de intro (texto plano, citable). */
  intro: string[];
  /** true → intro genérica pendiente de datos verificables (revisión Carlos). */
  needsReview?: boolean;
};

export type CategoryContent = {
  /** Valor REAL de la categoría (product_type) usado como scope del catálogo. */
  name: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  intro: string[];
  bullets?: { heading: string; items: string[] }[];
};

export type TipoContent = {
  /** Valor REAL de `tipo_herramienta` usado como scope del catálogo (scope.tipo). */
  name: string;
  /** H1 del hero. */
  title: string;
  metaTitle: string;
  metaDescription: string;
  intro: string[];
  bullets?: { heading: string; items: string[] }[];
};

export type IsoContent = {
  /** Código de familia ISO en MAYÚSCULAS; scope por PREFIJO de `designacion_iso`. */
  code: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  intro: string[];
  bullets?: { heading: string; items: string[] }[];
};

// ── MARCAS ──────────────────────────────────────────────────────────────────
// Claves = slug de marca (minúsculas, sin espacios). Deben cubrir site.brands.
export const BRAND_CONTENT: Record<string, BrandContent> = {
  iscar: {
    name: "Iscar",
    title: "Herramientas Iscar",
    metaTitle: "Herramientas Iscar en México | HERCAN",
    metaDescription:
      "Distribución de herramientas de corte Iscar en México: insertos, fresas y portaherramientas para torneado, fresado y perforación. Cotización B2B en HERCAN.",
    intro: [
      "Iscar es un fabricante israelí de herramientas de corte de metal y forma parte del grupo IMC (International Metalworking Companies). Su línea abarca insertos intercambiables, fresas, brocas y portaherramientas para las principales operaciones de maquinado.",
      "En HERCAN distribuimos herramental Iscar para torneado, fresado, perforación y roscado, con atención B2B para talleres, plantas e integradores en México.",
    ],
  },
  toolmex: {
    name: "Toolmex",
    title: "Herramientas Toolmex",
    metaTitle: "Herramientas Toolmex en México | HERCAN",
    metaDescription:
      "Herramental industrial Toolmex en HERCAN: herramienta de corte HSS y de carburo para torno, fresado y taladrado. Amplio catálogo con cotización B2B en México.",
    intro: [
      "Toolmex es una marca de herramental industrial de corte, con herramienta de acero rápido (HSS) y de carburo para operaciones de torneado, fresado y taladrado.",
      "Es una de las líneas con mayor presencia en el catálogo de HERCAN. La distribuimos con atención B2B y disponibilidad para talleres y plantas en México.",
    ],
  },
  yg: {
    name: "YG",
    title: "Herramientas YG-1",
    metaTitle: "Herramientas YG-1 en México | HERCAN",
    metaDescription:
      "Fresas, brocas y machuelos de carburo y HSS de YG-1 en HERCAN. Herramienta de corte de alto rendimiento con cotización B2B en México.",
    intro: [
      "YG-1 es un fabricante surcoreano de herramientas de corte, reconocido por sus fresas integrales (endmills), brocas y machuelos de carburo y acero rápido (HSS).",
      "En HERCAN distribuimos herramienta YG-1 para fresado, perforación y roscado, con atención técnica B2B en México.",
    ],
  },
  palbit: {
    name: "Palbit",
    title: "Herramientas Palbit",
    metaTitle: "Herramientas Palbit en México | HERCAN",
    metaDescription:
      "Insertos y herramienta de corte de metal duro (carburo) Palbit en HERCAN. Distribución B2B para maquinado en México.",
    intro: [
      "Palbit es un fabricante portugués de metal duro (carburo), con insertos intercambiables y herramienta de corte para torneado, fresado y perforación.",
      "En HERCAN distribuimos herramental Palbit con atención B2B para la industria metalmecánica en México.",
    ],
  },
  hercan: {
    name: "Hercan",
    title: "Línea Hercan",
    metaTitle: "Herramental marca Hercan | HERCAN",
    metaDescription:
      "Herramental de la línea propia Hercan, distribuido por HERCAN: herramientas de corte y equipos de medición para CNC con cotización B2B en México.",
    intro: [
      "HERCAN es un distribuidor B2B industrial de herramientas de corte de carburo y equipos de medición, con operación en Monterrey y Saltillo y envíos a todo México.",
      "Bajo la línea Hercan agrupamos herramental que distribuimos directamente. Ofrecemos asesoría técnica y cotización por volumen para talleres, plantas e integradores.",
    ],
  },
  // ⚠️ needsReview — datos no verificados. Intro genérica a propósito.
  titanium: {
    name: "Titanium",
    title: "Herramientas Titanium",
    metaTitle: "Herramientas Titanium en México | HERCAN",
    metaDescription:
      "Herramental de la marca Titanium distribuido por HERCAN. Consulta el catálogo disponible y solicita cotización B2B en México.",
    intro: [
      "Titanium es una marca de herramental que HERCAN distribuye para la industria metalmecánica en México.",
      "Consulta el catálogo disponible de Titanium y solicita cotización B2B con nuestro equipo.",
    ],
    needsReview: true,
  },
  // ⚠️ needsReview — datos no verificados. Intro genérica a propósito.
  kta: {
    name: "KTA",
    title: "Herramientas KTA",
    metaTitle: "Herramientas KTA en México | HERCAN",
    metaDescription:
      "Herramental de la marca KTA distribuido por HERCAN. Consulta el catálogo disponible y solicita cotización B2B en México.",
    intro: [
      "KTA es una marca de herramental que HERCAN distribuye para la industria metalmecánica en México.",
      "Consulta el catálogo disponible de KTA y solicita cotización B2B con nuestro equipo.",
    ],
    needsReview: true,
  },
  insize: {
    name: "Insize",
    title: "Instrumentos Insize",
    metaTitle: "Instrumentos de medición Insize en México | HERCAN",
    metaDescription:
      "Instrumentos de medición Insize en HERCAN: calibradores, micrómetros e indicadores para control dimensional. Cotización B2B en México.",
    intro: [
      "Insize es una marca de instrumentos de medición y metrología: calibradores, micrómetros, indicadores y accesorios para control dimensional.",
      "En HERCAN distribuimos instrumentos Insize para verificación e inspección en taller y laboratorio, con atención B2B en México.",
    ],
  },
  mitutoyo: {
    name: "Mitutoyo",
    title: "Instrumentos Mitutoyo",
    metaTitle: "Instrumentos de medición Mitutoyo en México | HERCAN",
    metaDescription:
      "Equipos de medición de precisión Mitutoyo en HERCAN: calibradores, micrómetros e indicadores de carátula. Cotización B2B en México.",
    intro: [
      "Mitutoyo es un fabricante japonés de instrumentos de metrología y medición de precisión, como calibradores vernier, micrómetros e indicadores de carátula.",
      "En HERCAN distribuimos equipos de medición Mitutoyo para control dimensional en taller y laboratorio, con atención B2B en México.",
    ],
  },
};

// ── CATEGORÍAS ────────────────────────────────────────────────────────────────
// Claves = slug de categoría. `name` = product_type real (para el scope). El orden
// de inserción alimenta la franja de "otras categorías" y el sitemap. Cubre las 9
// categorías del negocio (incluye Accesorios/Ranurado/Abrasivos, aún sin volumen
// en el catálogo actual → forward-compatible).
export const CATEGORY_CONTENT: Record<string, CategoryContent> = {
  fresado: {
    name: "Fresado",
    title: "Fresado",
    metaTitle: "Fresado: fresas, insertos y cabezales | HERCAN",
    metaDescription:
      "Herramienta de fresado en HERCAN: fresas integrales, cortadores con insertos y cabezales de careado para CNC. Filtra por marca, material y recubrimiento.",
    intro: [
      "El fresado es una operación de arranque de viruta en la que una herramienta rotativa de varios filos (la fresa) remueve material de una pieza que suele permanecer fija. Es una de las operaciones más versátiles del maquinado CNC.",
      "Comprende fresas integrales (endmills), cortadores con insertos intercambiables y cabezales de careado, y se emplea para planeado, ranurado, contorneado y cajeado, entre otras operaciones.",
    ],
    bullets: [
      {
        heading: "Herramientas típicas",
        items: [
          "Fresas integrales (endmills)",
          "Cortadores y portainsertos",
          "Insertos de fresado",
          "Cabezales de careado",
        ],
      },
      {
        heading: "Aplicaciones",
        items: ["Planeado y careado", "Ranurado y cajeado", "Contorneado y perfilado"],
      },
    ],
  },
  torneado: {
    name: "Torneado",
    title: "Torneado",
    metaTitle: "Torneado: insertos, portaherramientas y barras | HERCAN",
    metaDescription:
      "Herramienta de torneado en HERCAN: insertos intercambiables, portaherramientas y barras de mandrinar para torno CNC. Filtra por marca y material.",
    intro: [
      "El torneado es una operación en la que la pieza gira sobre su eje mientras una herramienta de un solo filo remueve material, normalmente en un torno. Permite generar superficies cilíndricas y cónicas con buena precisión.",
      "Se realiza con insertos intercambiables montados en portaherramientas y con barras de mandrinar para operaciones en el interior de la pieza.",
    ],
    bullets: [
      {
        heading: "Herramientas típicas",
        items: ["Insertos de torneado", "Portaherramientas", "Barras de mandrinar"],
      },
      {
        heading: "Aplicaciones",
        items: ["Cilindrado y refrentado", "Mandrinado interior", "Roscado y tronzado"],
      },
    ],
  },
  perforacion: {
    name: "Perforación",
    title: "Perforación",
    metaTitle: "Perforación: brocas, escariadores y cabezales | HERCAN",
    metaDescription:
      "Herramienta de perforación en HERCAN: brocas de carburo y HSS, brocas de inserto, cabezales intercambiables y escariadores para CNC. Cotización B2B.",
    intro: [
      "La perforación (o taladrado) es la operación de crear o agrandar agujeros mediante una herramienta rotativa de corte, generalmente una broca. Es un proceso base, previo a roscado, escariado o mandrinado.",
      "Abarca brocas de carburo y de acero rápido (HSS), brocas de inserto intercambiable, cabezales de perforación y escariadores para el acabado de agujeros.",
    ],
    bullets: [
      {
        heading: "Herramientas típicas",
        items: [
          "Brocas de carburo y HSS",
          "Brocas de inserto",
          "Cabezales intercambiables",
          "Escariadores",
        ],
      },
      {
        heading: "Aplicaciones",
        items: ["Taladrado de agujeros", "Escariado de acabado", "Avellanado"],
      },
    ],
  },
  roscado: {
    name: "Roscado",
    title: "Roscado",
    metaTitle: "Roscado: machuelos, fresas e insertos de rosca | HERCAN",
    metaDescription:
      "Herramienta de roscado en HERCAN: machuelos, fresas de roscar e insertos de roscado para roscas internas y externas. Filtra por marca y material.",
    intro: [
      "El roscado es la generación de roscas internas o externas sobre una pieza. Por arranque de viruta se realiza con machuelos, fresas de roscar e insertos de roscado; también existe el roscado por conformado.",
      "La herramienta se elige según el tipo de rosca, el material a maquinar y si la rosca es interior o exterior.",
    ],
    bullets: [
      {
        heading: "Herramientas típicas",
        items: ["Machuelos", "Fresas de roscar", "Insertos de roscado", "Dados"],
      },
      {
        heading: "Aplicaciones",
        items: ["Roscas internas", "Roscas externas", "Roscado en CNC"],
      },
    ],
  },
  ranurado: {
    name: "Ranurado/Tronzado",
    title: "Ranurado y tronzado",
    metaTitle: "Ranurado y tronzado: insertos y portaherramientas | HERCAN",
    metaDescription:
      "Herramienta de ranurado y tronzado en HERCAN: insertos y portaherramientas para ranuras y corte de piezas en torno. Cotización B2B en México.",
    intro: [
      "El ranurado y el tronzado son operaciones de torneado orientadas a mecanizar ranuras (axiales, radiales o frontales) y a cortar o separar la pieza terminada del material en bruto.",
      "Se realizan con insertos y portaherramientas específicos, seleccionados según el ancho de ranura y la profundidad de corte requeridos.",
    ],
    bullets: [
      {
        heading: "Herramientas típicas",
        items: ["Insertos de ranurado y tronzado", "Portaherramientas de ranurado"],
      },
      {
        heading: "Aplicaciones",
        items: [
          "Ranuras para anillos de retención",
          "Tronzado de piezas",
          "Ranurado frontal y radial",
        ],
      },
    ],
  },
  portaherramientas: {
    name: "Portaherramientas",
    title: "Portaherramientas",
    metaTitle: "Portaherramientas para CNC: conos, boquillas y mandriles | HERCAN",
    metaDescription:
      "Portaherramientas para CNC en HERCAN: conos (BT, HSK, CAT), boquillas, mandriles y extensiones para sujetar herramienta de corte. Cotización B2B.",
    intro: [
      "Los portaherramientas son los sistemas de sujeción que conectan la herramienta de corte con el husillo o la torreta de la máquina. De su rigidez y precisión de sujeción dependen la concentricidad y el acabado de la pieza.",
      "Incluyen conos (BT, HSK, CAT), boquillas, mandriles y extensiones, seleccionados según la interfaz de la máquina y el tipo de herramienta.",
    ],
    bullets: [
      {
        heading: "Tipos comunes",
        items: [
          "Conos BT / HSK / CAT",
          "Boquillas y mandriles",
          "Extensiones y adaptadores",
        ],
      },
    ],
  },
  abrasivos: {
    name: "Abrasivos",
    title: "Abrasivos",
    metaTitle: "Abrasivos: muelas, discos y puntas montadas | HERCAN",
    metaDescription:
      "Abrasivos en HERCAN: muelas de rectificado, discos de corte y desbaste, puntas montadas y bandas para acabado de superficies. Cotización B2B.",
    intro: [
      "Los abrasivos son herramientas que remueven material por abrasión, mediante granos de corte unidos en muelas, discos, bandas o puntas montadas. Se usan en rectificado, desbaste, corte y acabado de superficies.",
      "La elección del abrasivo depende del material a trabajar, el acabado buscado y el tipo de máquina.",
    ],
    bullets: [
      {
        heading: "Tipos comunes",
        items: [
          "Muelas de rectificado",
          "Discos de corte y desbaste",
          "Puntas montadas",
          "Lijas y bandas",
        ],
      },
    ],
  },
  medicion: {
    name: "Medición",
    title: "Equipos de medición",
    metaTitle: "Equipos de medición y metrología para taller | HERCAN",
    metaDescription:
      "Equipos de medición en HERCAN: calibradores vernier, micrómetros, indicadores de carátula y bloques patrón para control dimensional. Mitutoyo, Insize y más.",
    intro: [
      "Los equipos de medición permiten el control dimensional y la metrología en taller y laboratorio: verificar dimensiones, tolerancias y geometrías de las piezas maquinadas.",
      "Incluyen calibradores vernier, micrómetros, indicadores de carátula y bloques patrón, en versiones análogas y digitales.",
    ],
    bullets: [
      {
        heading: "Instrumentos típicos",
        items: [
          "Calibradores vernier",
          "Micrómetros",
          "Indicadores de carátula",
          "Bloques patrón",
        ],
      },
    ],
  },
  accesorios: {
    name: "Accesorios",
    title: "Accesorios",
    metaTitle: "Accesorios para herramental y máquinas CNC | HERCAN",
    metaDescription:
      "Accesorios y consumibles para herramental y máquinas CNC en HERCAN. Consulta el catálogo disponible y solicita cotización B2B en México.",
    intro: [
      "En accesorios agrupamos los complementos y consumibles que apoyan el uso del herramental y de las máquinas: repuestos, elementos de sujeción y otros artículos auxiliares del taller.",
      "Consulta el catálogo disponible y solicita cotización B2B para tu operación.",
    ],
  },
};

// ── TIPOS DE HERRAMIENTA ──────────────────────────────────────────────────────
// Claves = slug de tipo (slugify del valor real de `tipo_herramienta`). `name` = el
// valor EXACTO usado como scope. Cubre los tipos de herramienta de corte del negocio
// (Bloque 2 del CLAUDE.md), SIN "Otro". El contenido es conocimiento general de
// maquinado (factual), no marketing de fabricante.
export const TIPO_CONTENT: Record<string, TipoContent> = {
  inserto: {
    name: "Inserto",
    title: "Insertos intercambiables",
    metaTitle: "Insertos intercambiables para torno y fresado | HERCAN",
    metaDescription:
      "Insertos (plaquitas) de corte intercambiables en HERCAN: metal duro para torneado, fresado y perforación, normalizados por ISO 1832. Filtra por marca, material y recubrimiento.",
    intro: [
      "Un inserto (o plaquita) es la pieza de corte intercambiable que se sujeta mecánicamente en un portaherramientas o en el cuerpo de una fresa. Cuando un filo se desgasta, el inserto se indexa a un filo nuevo o se reemplaza, sin necesidad de reafilar la herramienta.",
      "La mayoría son de metal duro (carburo), con frecuencia recubiertos, y sus formas y medidas están normalizadas por la norma ISO 1832, lo que permite intercambiarlos entre fabricantes.",
    ],
    bullets: [
      {
        heading: "Operaciones",
        items: ["Torneado", "Fresado", "Perforación", "Ranurado y roscado"],
      },
    ],
  },
  "fresa-endmill": {
    name: "Fresa/Endmill",
    title: "Fresas integrales (endmills)",
    metaTitle: "Fresas integrales (endmills) de carburo y HSS | HERCAN",
    metaDescription:
      "Fresas integrales o endmills en HERCAN: herramienta rotativa de carburo y HSS para ranurado, contorneado y refrentado de hombros en CNC. Filtra por marca, material y recubrimiento.",
    intro: [
      "Una fresa integral o endmill es una herramienta rotativa de fresado con filos de corte en la periferia y, según el tipo, también en la cara frontal. Se fabrica en una sola pieza, normalmente de metal duro (carburo) o acero rápido (HSS).",
      "Se emplea en ranurado, contorneado, refrentado de hombros y perfilado en fresadoras y centros de maquinado CNC. El número de filos (flautas) y el ángulo de hélice se eligen según el material y el tipo de corte.",
    ],
    bullets: [
      {
        heading: "Operaciones",
        items: ["Ranurado", "Contorneado", "Refrentado de hombros", "Perfilado"],
      },
    ],
  },
  broca: {
    name: "Broca",
    title: "Brocas",
    metaTitle: "Brocas de carburo, HSS y de inserto | HERCAN",
    metaDescription:
      "Brocas en HERCAN: brocas helicoidales de carburo y HSS y brocas de inserto intercambiable para taladrado en CNC. Filtra por marca, material y recubrimiento.",
    intro: [
      "Una broca es una herramienta rotativa de corte para crear o agrandar agujeros. La broca helicoidal, con dos filos y canales en hélice que evacuan la viruta, es la más común; existen en metal duro (carburo) y acero rápido (HSS), además de brocas de inserto intercambiable.",
      "El taladrado suele ser una operación previa al roscado, el escariado o el mandrinado. La geometría de la punta y el recubrimiento influyen en la penetración y en la vida de la herramienta.",
    ],
    bullets: [
      {
        heading: "Tipos comunes",
        items: ["Broca helicoidal", "Broca de carburo", "Broca de inserto"],
      },
    ],
  },
  machuelo: {
    name: "Machuelo",
    title: "Machuelos",
    metaTitle: "Machuelos para roscado interno (HSS y carburo) | HERCAN",
    metaDescription:
      "Machuelos en HERCAN: herramienta de roscado interno por arranque de viruta, en HSS y metal duro, para agujero pasante y ciego. Cotización B2B en México.",
    intro: [
      "Un machuelo es la herramienta que genera roscas internas por arranque de viruta dentro de un agujero previamente taladrado. Sus filos reproducen el perfil de la rosca a medida que la herramienta avanza girando.",
      "Existen machuelos de acero rápido (HSS) y de metal duro, con variantes para agujero pasante o ciego según cómo evacuen la viruta. El diámetro del barreno previo se define por el paso y el tipo de rosca.",
    ],
    bullets: [
      {
        heading: "Aplicaciones",
        items: ["Roscas internas", "Agujero pasante y ciego"],
      },
    ],
  },
  cortador: {
    name: "Cortador",
    title: "Cortadores y portainsertos",
    metaTitle: "Cortadores y portainsertos para fresado | HERCAN",
    metaDescription:
      "Cortadores y cuerpos portainsertos en HERCAN: alojan insertos intercambiables para careado, escuadrado y ranurado en CNC. Filtra por marca y material.",
    intro: [
      "En este catálogo, «cortador» agrupa los cuerpos de fresa y cortadores que alojan insertos intercambiables, así como cortadores de fresado que no corresponden a una fresa integral. El cuerpo sujeta uno o varios insertos que realizan el corte.",
      "Se utilizan en fresado de careado, escuadrado y ranurado, y permiten reponer solo los insertos cuando se desgastan, sin sustituir todo el cortador.",
    ],
    bullets: [
      {
        heading: "Aplicaciones",
        items: ["Careado", "Escuadrado", "Ranurado"],
      },
    ],
  },
  escariador: {
    name: "Escariador",
    title: "Escariadores",
    metaTitle: "Escariadores para acabado de agujeros | HERCAN",
    metaDescription:
      "Escariadores (rimas) en HERCAN: herramienta rotativa de acabado que calibra y afina agujeros taladrados a tolerancia estrecha. En HSS y metal duro. Cotización B2B.",
    intro: [
      "Un escariador (rima) es una herramienta rotativa de acabado que calibra y afina un agujero ya taladrado, mejorando su tolerancia dimensional y su acabado superficial. Remueve una pequeña cantidad de material con varios filos.",
      "Se emplea cuando el agujero requiere un ajuste preciso, por ejemplo para alojar pasadores o bujes. Existen escariadores de acero rápido (HSS) y de metal duro.",
    ],
    bullets: [
      {
        heading: "Aplicaciones",
        items: ["Calibrado de agujeros", "Acabado de precisión"],
      },
    ],
  },
  "barra-mandrinar": {
    name: "Barra mandrinar",
    title: "Barras de mandrinar",
    metaTitle: "Barras de mandrinar para diámetros internos | HERCAN",
    metaDescription:
      "Barras de mandrinar en HERCAN: herramienta para agrandar y afinar diámetros internos (boring) en torno, con inserto en el extremo. Filtra por marca y material.",
    intro: [
      "Una barra de mandrinar es la herramienta que agranda y afina diámetros internos (mandrinado o boring), normalmente en torno. Lleva un inserto o filo en el extremo, y su rigidez determina la profundidad que puede alcanzar sin vibración.",
      "Se usa para lograr diámetros interiores precisos y buen acabado, en agujeros previamente taladrados o fundidos. La relación de voladizo (longitud/diámetro) es clave para evitar el traqueteo (chatter).",
    ],
    bullets: [
      {
        heading: "Aplicaciones",
        items: ["Mandrinado interior", "Acabado de diámetros internos"],
      },
    ],
  },
  portaherramientas: {
    name: "Portaherramientas",
    title: "Portaherramientas",
    metaTitle: "Portaherramientas para CNC: conos, boquillas y mandriles | HERCAN",
    metaDescription:
      "Portaherramientas para CNC en HERCAN: conos (BT, HSK, CAT), boquillas, mandriles portafresas y portaherramientas de torno. Sujeción rígida y concéntrica. Cotización B2B.",
    intro: [
      "Un portaherramientas es el elemento de sujeción que conecta la herramienta de corte con el husillo o la torreta de la máquina. Su rigidez y su precisión de sujeción determinan la concentricidad, la estabilidad del corte y, en buena medida, el acabado obtenido.",
      "Abarca conos de máquina (BT, HSK, CAT), boquillas, mandriles portafresas y portaherramientas de torno que alojan insertos. La elección depende de la interfaz de la máquina, el tipo de herramienta y la operación.",
    ],
    bullets: [
      {
        heading: "Tipos comunes",
        items: ["Conos BT / HSK / CAT", "Boquillas y mandriles", "Portaherramientas de torno"],
      },
    ],
  },
};

// ── FAMILIAS ISO (insertos) ───────────────────────────────────────────────────
// Claves = código de familia en minúsculas. `code` = prefijo en MAYÚSCULAS con el que
// se hace el scope (prefijo de `designacion_iso`). Set CURADO de las familias de
// inserto más comunes de la norma ISO 1832 (torneado + una de fresado). Es
// FORWARD-COMPATIBLE: hoy el catálogo aún se importa, así que estas páginas pueden dar
// 0 productos y muestran igual el hero informativo. El contenido decodifica la norma
// (forma por la 1.ª letra, ángulo de incidencia por la 2.ª) — hecho técnico, no inventado.
export const ISO_CONTENT: Record<string, IsoContent> = {
  cnmg: {
    code: "CNMG",
    title: "Insertos CNMG",
    metaTitle: "Insertos CNMG (ISO 1832) para torneado | HERCAN",
    metaDescription:
      "Insertos CNMG: forma rómbica de 80°, negativos de doble cara (ISO 1832). Geometría de propósito general para torneado de desbaste a acabado en acero y fundición.",
    intro: [
      "La familia CNMG designa insertos de torneado con forma rómbica de 80° (letra C) y ángulo de incidencia de 0° (letra N); es decir, insertos negativos de doble cara. La codificación sigue la norma ISO 1832.",
      "El ángulo de 80° del vértice ofrece un filo robusto, por lo que el CNMG es una de las geometrías más usadas en torneado exterior de propósito general, del desbaste al acabado, en especial en acero y fundición.",
    ],
    bullets: [
      {
        heading: "Geometría",
        items: ["Forma rómbica 80° (C)", "Incidencia 0°, negativo (N)", "Doble cara, con agujero"],
      },
      {
        heading: "Uso típico",
        items: ["Torneado exterior general", "Desbaste y semiacabado", "Acero y fundición"],
      },
    ],
  },
  tnmg: {
    code: "TNMG",
    title: "Insertos TNMG",
    metaTitle: "Insertos TNMG (ISO 1832) para torneado | HERCAN",
    metaDescription:
      "Insertos TNMG: forma triangular de 60°, negativos de doble cara (ISO 1832) con tres filos por cara. Torneado general de cilindrado y refrentado.",
    intro: [
      "La familia TNMG corresponde a insertos de torneado de forma triangular de 60° (letra T) con incidencia de 0° (letra N): insertos negativos de doble cara, según ISO 1832.",
      "La forma triangular ofrece tres filos por cara (seis en total), lo que da buena economía por filo en torneado exterior de propósito general. Es habitual en cilindrado y refrentado de acero y fundición.",
    ],
    bullets: [
      {
        heading: "Geometría",
        items: ["Forma triangular 60° (T)", "Incidencia 0°, negativo (N)", "Tres filos por cara"],
      },
      {
        heading: "Uso típico",
        items: ["Torneado general", "Cilindrado y refrentado", "Acero y fundición"],
      },
    ],
  },
  dnmg: {
    code: "DNMG",
    title: "Insertos DNMG",
    metaTitle: "Insertos DNMG (ISO 1832) para torneado | HERCAN",
    metaDescription:
      "Insertos DNMG: forma rómbica de 55°, negativos de doble cara (ISO 1832). Torneado general con capacidad de perfilado y copiado ligero.",
    intro: [
      "DNMG designa insertos de torneado de forma rómbica de 55° (letra D) con incidencia de 0° (letra N): negativos de doble cara, bajo la norma ISO 1832.",
      "El vértice de 55° es más agudo que el del CNMG, lo que combina buena resistencia con capacidad de perfilado. Se emplea en torneado exterior de propósito general y en copiado ligero.",
    ],
    bullets: [
      {
        heading: "Geometría",
        items: ["Forma rómbica 55° (D)", "Incidencia 0°, negativo (N)", "Doble cara"],
      },
      {
        heading: "Uso típico",
        items: ["Torneado general", "Perfilado y copiado ligero"],
      },
    ],
  },
  wnmg: {
    code: "WNMG",
    title: "Insertos WNMG",
    metaTitle: "Insertos WNMG (ISO 1832) para torneado | HERCAN",
    metaDescription:
      "Insertos WNMG: forma trigonal de 80°, negativos de doble cara (ISO 1832) con filo robusto y tres filos por cara. Torneado general de desbaste a semiacabado.",
    intro: [
      "WNMG corresponde a insertos de torneado de forma trigonal de 80° (letra W) con incidencia de 0° (letra N): negativos de doble cara (ISO 1832).",
      "La forma trigonal aporta un filo robusto y tres filos por cara, con buena estabilidad. Es común en torneado exterior de propósito general, del desbaste al semiacabado.",
    ],
    bullets: [
      {
        heading: "Geometría",
        items: ["Forma trigonal 80° (W)", "Incidencia 0°, negativo (N)", "Tres filos por cara"],
      },
      {
        heading: "Uso típico",
        items: ["Torneado general", "Desbaste y semiacabado"],
      },
    ],
  },
  snmg: {
    code: "SNMG",
    title: "Insertos SNMG",
    metaTitle: "Insertos SNMG (ISO 1832) para torneado | HERCAN",
    metaDescription:
      "Insertos SNMG: forma cuadrada de 90°, negativos de doble cara (ISO 1832) con cuatro filos por cara. Desbaste, refrentado y cortes de alta carga.",
    intro: [
      "SNMG designa insertos de torneado de forma cuadrada de 90° (letra S) con incidencia de 0° (letra N): negativos de doble cara según ISO 1832.",
      "La forma cuadrada ofrece cuatro filos por cara (ocho en total) y un vértice muy resistente, idóneo para desbaste, refrentado y torneado de alta carga en acero y fundición.",
    ],
    bullets: [
      {
        heading: "Geometría",
        items: ["Forma cuadrada 90° (S)", "Incidencia 0°, negativo (N)", "Cuatro filos por cara"],
      },
      {
        heading: "Uso típico",
        items: ["Desbaste y refrentado", "Cortes de alta carga"],
      },
    ],
  },
  vnmg: {
    code: "VNMG",
    title: "Insertos VNMG",
    metaTitle: "Insertos VNMG (ISO 1832) para torneado | HERCAN",
    metaDescription:
      "Insertos VNMG: forma rómbica de 35°, negativos de doble cara (ISO 1832). Vértice agudo para perfilado y contorneado en torno.",
    intro: [
      "VNMG corresponde a insertos de torneado de forma rómbica de 35° (letra V) con incidencia de 0° (letra N): negativos de doble cara (ISO 1832).",
      "El vértice muy agudo de 35° permite acceso a contornos y cambios de dirección, por lo que se usa en perfilado y copiado. A cambio, el filo es más frágil que en formas de mayor ángulo.",
    ],
    bullets: [
      {
        heading: "Geometría",
        items: ["Forma rómbica 35° (V)", "Incidencia 0°, negativo (N)", "Doble cara"],
      },
      {
        heading: "Uso típico",
        items: ["Perfilado y contorneado", "Copiado"],
      },
    ],
  },
  cnmm: {
    code: "CNMM",
    title: "Insertos CNMM",
    metaTitle: "Insertos CNMM (ISO 1832) para desbaste | HERCAN",
    metaDescription:
      "Insertos CNMM: forma rómbica de 80°, negativos de doble cara (ISO 1832) con geometría de desbaste. Para grandes avances y profundidades en torneado.",
    intro: [
      "CNMM designa insertos de torneado de forma rómbica de 80° (letra C) con incidencia de 0° (letra N) y una geometría (letra M) orientada al desbaste: insertos negativos de doble cara según ISO 1832.",
      "Comparte la forma de 80° del CNMG, pero su geometría rompevirutas está pensada para grandes secciones de viruta. Es una elección típica para desbaste pesado en torneado de acero y fundición.",
    ],
    bullets: [
      {
        heading: "Geometría",
        items: ["Forma rómbica 80° (C)", "Incidencia 0°, negativo (N)", "Geometría de desbaste (M)"],
      },
      {
        heading: "Uso típico",
        items: ["Desbaste pesado", "Grandes avances y profundidades"],
      },
    ],
  },
  ccmt: {
    code: "CCMT",
    title: "Insertos CCMT",
    metaTitle: "Insertos CCMT (ISO 1832) para acabado y mandrinado | HERCAN",
    metaDescription:
      "Insertos CCMT: forma rómbica de 80°, positivos de una cara (ISO 1832). Baja fuerza de corte para acabado, piezas delgadas y mandrinado interior.",
    intro: [
      "CCMT designa insertos de torneado de forma rómbica de 80° (letra C) con ángulo de incidencia de 7° (letra C): insertos positivos de una sola cara, según ISO 1832.",
      "Al ser positivos, generan menores fuerzas de corte que un inserto negativo equivalente, por lo que se usan en acabado y semiacabado, torneado de piezas delgadas y, con frecuencia, en mandrinado interior.",
    ],
    bullets: [
      {
        heading: "Geometría",
        items: ["Forma rómbica 80° (C)", "Incidencia 7°, positivo (C)", "Una cara"],
      },
      {
        heading: "Uso típico",
        items: ["Acabado y semiacabado", "Mandrinado interior"],
      },
    ],
  },
  dcmt: {
    code: "DCMT",
    title: "Insertos DCMT",
    metaTitle: "Insertos DCMT (ISO 1832) para acabado y perfilado | HERCAN",
    metaDescription:
      "Insertos DCMT: forma rómbica de 55°, positivos de una cara (ISO 1832). Acabado, perfilado, piezas de diámetro pequeño y mandrinado.",
    intro: [
      "DCMT corresponde a insertos de torneado de forma rómbica de 55° (letra D) con incidencia de 7° (letra C): positivos de una sola cara (ISO 1832).",
      "Combina un vértice de 55° apto para perfilar con la baja fuerza de corte de un inserto positivo. Es habitual en acabado, piezas de diámetro pequeño y mandrinado.",
    ],
    bullets: [
      {
        heading: "Geometría",
        items: ["Forma rómbica 55° (D)", "Incidencia 7°, positivo (C)", "Una cara"],
      },
      {
        heading: "Uso típico",
        items: ["Acabado y perfilado", "Mandrinado y piezas pequeñas"],
      },
    ],
  },
  vbmt: {
    code: "VBMT",
    title: "Insertos VBMT",
    metaTitle: "Insertos VBMT (ISO 1832) para perfilado y acabado | HERCAN",
    metaDescription:
      "Insertos VBMT: forma rómbica de 35°, positivos de una cara (ISO 1832). Vértice agudo y baja fuerza de corte para perfilado y contornos.",
    intro: [
      "VBMT designa insertos de torneado de forma rómbica de 35° (letra V) con incidencia de 5° (letra B): positivos de una sola cara según ISO 1832.",
      "El vértice agudo de 35° facilita el perfilado y el acceso a contornos, mientras que el diseño positivo reduce las fuerzas de corte. Se usa en acabado y torneado de contornos.",
    ],
    bullets: [
      {
        heading: "Geometría",
        items: ["Forma rómbica 35° (V)", "Incidencia 5°, positivo (B)", "Una cara"],
      },
      {
        heading: "Uso típico",
        items: ["Perfilado y acabado", "Contornos"],
      },
    ],
  },
  tcmt: {
    code: "TCMT",
    title: "Insertos TCMT",
    metaTitle: "Insertos TCMT (ISO 1832) para acabado y mandrinado | HERCAN",
    metaDescription:
      "Insertos TCMT: forma triangular de 60°, positivos de una cara (ISO 1832). Acabado y semiacabado, frecuente en mandrinado interior de diámetros pequeños.",
    intro: [
      "TCMT corresponde a insertos de torneado de forma triangular de 60° (letra T) con incidencia de 7° (letra C): positivos de una sola cara (ISO 1832).",
      "El diseño positivo y la forma triangular lo hacen adecuado para acabado y semiacabado, y es una opción frecuente en mandrinado interior de diámetros pequeños.",
    ],
    bullets: [
      {
        heading: "Geometría",
        items: ["Forma triangular 60° (T)", "Incidencia 7°, positivo (C)", "Una cara"],
      },
      {
        heading: "Uso típico",
        items: ["Acabado y semiacabado", "Mandrinado interior"],
      },
    ],
  },
  vcmt: {
    code: "VCMT",
    title: "Insertos VCMT",
    metaTitle: "Insertos VCMT (ISO 1832) para perfilado y acabado | HERCAN",
    metaDescription:
      "Insertos VCMT: forma rómbica de 35°, positivos de una cara (ISO 1832). Vértice agudo para perfilar y contornear con baja fuerza de corte.",
    intro: [
      "VCMT designa insertos de torneado de forma rómbica de 35° (letra V) con incidencia de 7° (letra C): positivos de una sola cara según ISO 1832.",
      "Como el VBMT, aprovecha el vértice agudo de 35° para perfilar, con un ángulo de incidencia de 7°. Se emplea en acabado y torneado de contornos con baja fuerza de corte.",
    ],
    bullets: [
      {
        heading: "Geometría",
        items: ["Forma rómbica 35° (V)", "Incidencia 7°, positivo (C)", "Una cara"],
      },
      {
        heading: "Uso típico",
        items: ["Perfilado y acabado", "Contornos"],
      },
    ],
  },
  rcmt: {
    code: "RCMT",
    title: "Insertos RCMT",
    metaTitle: "Insertos RCMT (ISO 1832) redondos para copiado | HERCAN",
    metaDescription:
      "Insertos RCMT: forma redonda, positivos de una cara (ISO 1832). Filo circular resistente para copiado, perfilado y ramping con acabado uniforme.",
    intro: [
      "RCMT corresponde a insertos de torneado de forma redonda (letra R) con incidencia de 7° (letra C): positivos de una sola cara (ISO 1832).",
      "El filo circular reparte el desgaste y resiste bien, lo que lo hace idóneo para copiado, perfilado y operaciones de ramping. El radio grande genera un acabado uniforme.",
    ],
    bullets: [
      {
        heading: "Geometría",
        items: ["Forma redonda (R)", "Incidencia 7°, positivo (C)", "Filo circular"],
      },
      {
        heading: "Uso típico",
        items: ["Copiado y perfilado", "Ramping"],
      },
    ],
  },
  ccgt: {
    code: "CCGT",
    title: "Insertos CCGT",
    metaTitle: "Insertos CCGT (ISO 1832) para acabado fino | HERCAN",
    metaDescription:
      "Insertos CCGT: forma rómbica de 80°, positivos y de tolerancia estrecha (ISO 1832), normalmente rectificados. Acabado fino de aluminio y no ferrosos.",
    intro: [
      "CCGT designa insertos de torneado de forma rómbica de 80° (letra C) con incidencia de 7° (letra C) y clase de tolerancia estrecha (letra G): son insertos positivos, normalmente rectificados de precisión, según ISO 1832.",
      "Su filo vivo y preciso los hace idóneos para acabado fino, en especial de aluminio y otros materiales no ferrosos, donde se busca bajo rozamiento y buen acabado superficial.",
    ],
    bullets: [
      {
        heading: "Geometría",
        items: ["Forma rómbica 80° (C)", "Incidencia 7°, positivo (C)", "Tolerancia estrecha (G)"],
      },
      {
        heading: "Uso típico",
        items: ["Acabado fino", "Aluminio y no ferrosos"],
      },
    ],
  },
  dcgt: {
    code: "DCGT",
    title: "Insertos DCGT",
    metaTitle: "Insertos DCGT (ISO 1832) para acabado y mandrinado | HERCAN",
    metaDescription:
      "Insertos DCGT: forma rómbica de 55°, positivos y de tolerancia estrecha (ISO 1832), normalmente rectificados. Acabado de aluminio y no ferrosos y mandrinado de precisión.",
    intro: [
      "DCGT corresponde a insertos de torneado de forma rómbica de 55° (letra D) con incidencia de 7° (letra C) y clase de tolerancia estrecha (letra G): positivos, habitualmente rectificados de precisión (ISO 1832).",
      "Combina un vértice de 55° para perfilar con un filo vivo de precisión. Se emplea en acabado de aluminio y no ferrosos y en mandrinado de diámetros pequeños.",
    ],
    bullets: [
      {
        heading: "Geometría",
        items: ["Forma rómbica 55° (D)", "Incidencia 7°, positivo (C)", "Tolerancia estrecha (G)"],
      },
      {
        heading: "Uso típico",
        items: ["Acabado de aluminio y no ferrosos", "Mandrinado de precisión"],
      },
    ],
  },
  apmt: {
    code: "APMT",
    title: "Insertos APMT",
    metaTitle: "Insertos APMT (ISO 1832) para fresado | HERCAN",
    metaDescription:
      "Insertos APMT de fresado: paralelogramo de 85°, positivos (ISO 1832). Para fresado de escuadrar a 90°, careado y ranurado en portainsertos.",
    intro: [
      "APMT designa insertos de fresado de forma de paralelogramo de 85° (letra A) con incidencia de 11° (letra P): insertos positivos, según ISO 1832.",
      "Se montan en cuerpos de fresa y portainsertos para fresado de escuadrar (hombros a 90°), careado y ranurado. El diseño positivo reduce las fuerzas de corte en el fresado.",
    ],
    bullets: [
      {
        heading: "Geometría",
        items: ["Paralelogramo 85° (A)", "Incidencia 11°, positivo (P)", "Inserto de fresado"],
      },
      {
        heading: "Uso típico",
        items: ["Fresado de escuadrar (90°)", "Careado y ranurado"],
      },
    ],
  },
};

// ── FAQS por CATEGORÍA y por TIPO (AEO/GEO) ───────────────────────────────────
// Preguntas/respuestas FACTUALES de maquinado (conocimiento general, no marketing
// ni datos inventados). FUENTE ÚNICA: el mismo array alimenta el bloque VISIBLE
// (<FaqAccordion>) y el JSON-LD FAQPage (faqNode) de la página → el texto visible
// coincide EXACTAMENTE con el del schema (regla de la receta build-website).
// Estilo answer-first: la respuesta va en la primera frase (mejor citabilidad en IA).
// Claves = mismos slugs que CATEGORY_CONTENT / TIPO_CONTENT. Las taxonomías sin
// entrada aquí (p. ej. "accesorios", demasiado genérica) simplemente no muestran
// FAQ: no se fuerza contenido que no sea verificable.

export const CATEGORY_FAQS: Record<string, Faq[]> = {
  fresado: [
    {
      question: "¿Qué es el fresado?",
      answer:
        "El fresado es una operación de maquinado en la que una herramienta rotativa de varios filos (la fresa) remueve material de una pieza que normalmente permanece fija. Es una de las operaciones más versátiles del CNC y permite planeado, ranurado, contorneado y cajeado.",
    },
    {
      question: "¿Qué herramienta se usa para fresar?",
      answer:
        "Se usan fresas integrales (endmills), cortadores con insertos intercambiables y cabezales de careado. La elección depende de la operación —planeado, ranurado o contorneado— y del material a maquinar.",
    },
    {
      question: "¿Cuál es la diferencia entre fresado y torneado?",
      answer:
        "En el fresado la herramienta gira y la pieza permanece fija; en el torneado es la pieza la que gira mientras una herramienta de un solo filo remueve material. El fresado genera superficies planas y perfiles; el torneado, superficies cilíndricas.",
    },
  ],
  torneado: [
    {
      question: "¿Qué es el torneado?",
      answer:
        "El torneado es una operación de maquinado en la que la pieza gira sobre su eje mientras una herramienta de un solo filo remueve material, normalmente en un torno. Permite generar superficies cilíndricas y cónicas con buena precisión.",
    },
    {
      question: "¿Qué herramienta se usa para tornear?",
      answer:
        "Se emplean insertos intercambiables montados en portaherramientas y barras de mandrinar para las operaciones en el interior de la pieza. El inserto se elige según el material a maquinar y si la operación es de desbaste o de acabado.",
    },
    {
      question: "¿Qué es un inserto de torneado?",
      answer:
        "Un inserto de torneado es una plaquita de corte intercambiable, casi siempre de metal duro (carburo), que se sujeta mecánicamente en el portaherramientas. Cuando un filo se desgasta, el inserto se indexa a otro filo o se reemplaza, sin reafilar la herramienta.",
    },
  ],
  perforacion: [
    {
      question: "¿Qué es la perforación o taladrado?",
      answer:
        "La perforación (o taladrado) es la operación de crear o agrandar agujeros mediante una herramienta rotativa de corte, generalmente una broca. Suele ser un proceso previo al roscado, el escariado o el mandrinado.",
    },
    {
      question: "¿Qué broca se usa según el material?",
      answer:
        "Para aceros y materiales duros se prefieren brocas de metal duro (carburo) o de acero rápido (HSS) recubiertas; para diámetros grandes existen brocas de inserto intercambiable. El recubrimiento y la geometría de la punta influyen en la penetración y en la vida de la herramienta.",
    },
    {
      question: "¿Cuál es la diferencia entre una broca y un escariador?",
      answer:
        "La broca crea o agranda el agujero; el escariador (rima) es una herramienta de acabado que calibra y afina un agujero ya taladrado para mejorar su tolerancia dimensional y su acabado superficial.",
    },
  ],
  roscado: [
    {
      question: "¿Qué es el roscado?",
      answer:
        "El roscado es la generación de roscas internas o externas sobre una pieza. Por arranque de viruta se realiza con machuelos, fresas de roscar e insertos de roscado; también existe el roscado por conformado, sin arranque de viruta.",
    },
    {
      question: "¿Qué herramienta se usa para roscar?",
      answer:
        "Para roscas internas se usan machuelos; para roscas externas, dados o terrajas. Las fresas de roscar y los insertos de roscado permiten generar ambos tipos de rosca en CNC. La elección depende del tipo de rosca y del material a maquinar.",
    },
    {
      question: "¿Cuál es la diferencia entre un machuelo y una fresa de roscar?",
      answer:
        "El machuelo genera una rosca del mismo diámetro que la herramienta y avanza girando dentro del agujero; la fresa de roscar interpola la rosca con control CNC, por lo que una misma fresa puede producir distintos diámetros y reduce el riesgo de rotura dentro de la pieza.",
    },
  ],
  ranurado: [
    {
      question: "¿Qué son el ranurado y el tronzado?",
      answer:
        "El ranurado y el tronzado son operaciones de torneado: el ranurado mecaniza ranuras —axiales, radiales o frontales— y el tronzado corta o separa la pieza terminada del material en bruto. Ambos se realizan con insertos y portaherramientas específicos.",
    },
    {
      question: "¿En qué se diferencia el ranurado del tronzado?",
      answer:
        "El ranurado crea una ranura de ancho y profundidad definidos sin separar la pieza; el tronzado lleva el corte hasta el centro para separar por completo la pieza del material en bruto.",
    },
    {
      question: "¿Cómo se elige el inserto de ranurado o tronzado?",
      answer:
        "Se selecciona según el ancho de corte y la profundidad de la ranura o el diámetro de la pieza a separar. El ancho del inserto define el ancho de la ranura, y la profundidad alcanzable depende de la rigidez del portaherramientas.",
    },
  ],
  portaherramientas: [
    {
      question: "¿Qué es un portaherramientas?",
      answer:
        "Un portaherramientas es el sistema de sujeción que conecta la herramienta de corte con el husillo o la torreta de la máquina. De su rigidez y precisión de sujeción dependen la concentricidad, la estabilidad del corte y el acabado de la pieza.",
    },
    {
      question: "¿Qué tipos de cono de portaherramientas existen?",
      answer:
        "Los más comunes son los conos BT, HSK y CAT, además de boquillas, mandriles y extensiones. La elección depende de la interfaz del husillo de la máquina y del tipo de herramienta que se va a sujetar.",
    },
    {
      question: "¿Qué diferencia hay entre un cono BT y uno HSK?",
      answer:
        "El cono BT hace contacto solo por el cono y es un estándar muy extendido; el HSK es un cono hueco que hace contacto simultáneo por cono y cara, lo que aporta mayor rigidez y precisión a altas revoluciones.",
    },
  ],
  abrasivos: [
    {
      question: "¿Qué son los abrasivos en el maquinado?",
      answer:
        "Los abrasivos son herramientas que remueven material por abrasión, mediante granos de corte unidos en muelas, discos, bandas o puntas montadas. Se usan en rectificado, desbaste, corte y acabado de superficies.",
    },
    {
      question: "¿Qué abrasivo se usa en cada aplicación?",
      answer:
        "Para rectificado de precisión se usan muelas; para corte y desbaste, discos; para acabado y zonas de difícil acceso, puntas montadas, lijas y bandas. La elección depende del material, del acabado buscado y del tipo de máquina.",
    },
    {
      question: "¿Qué es el rectificado?",
      answer:
        "El rectificado es una operación de acabado por abrasión que emplea una muela para remover pequeñas cantidades de material, logrando tolerancias estrechas y buen acabado superficial, en especial en piezas endurecidas o de precisión.",
    },
  ],
  medicion: [
    {
      question: "¿Qué equipos de medición se usan en un taller de maquinado?",
      answer:
        "Los más comunes son calibradores vernier, micrómetros, indicadores de carátula y bloques patrón, en versiones análogas y digitales. Permiten verificar dimensiones, tolerancias y geometrías de las piezas maquinadas.",
    },
    {
      question: "¿Cuál es la diferencia entre un calibrador y un micrómetro?",
      answer:
        "El calibrador vernier mide dimensiones exteriores, interiores y de profundidad con una resolución típica de 0.02 mm; el micrómetro cubre un rango más corto pero con mayor resolución (por lo general 0.01 mm o mejor), por lo que se usa cuando se requiere más precisión.",
    },
    {
      question: "¿Qué es un bloque patrón?",
      answer:
        "Un bloque patrón (o galga patrón) es un bloque de longitud altamente precisa que sirve como referencia para calibrar y verificar otros instrumentos de medición.",
    },
  ],
};

export const TIPO_FAQS: Record<string, Faq[]> = {
  inserto: [
    {
      question: "¿Qué es un inserto de corte?",
      answer:
        "Un inserto (o plaquita) es la pieza de corte intercambiable que se sujeta mecánicamente en un portaherramientas o en el cuerpo de una fresa. Cuando un filo se desgasta, el inserto se indexa a un filo nuevo o se reemplaza, sin reafilar la herramienta.",
    },
    {
      question: "¿Qué significan las letras de un inserto, como CNMG?",
      answer:
        "Es el código de la norma ISO 1832: la primera letra indica la forma del inserto (por ejemplo C = rómbico de 80°, T = triangular de 60°) y la segunda, el ángulo de incidencia (por ejemplo N = 0°, negativo). Las posiciones siguientes describen tolerancia, tipo de sujeción y medidas.",
    },
    {
      question: "¿Se pueden intercambiar insertos entre marcas?",
      answer:
        "Sí. Al estar normalizados por ISO 1832, los insertos de una misma designación (forma, tamaño y geometría) son intercambiables entre fabricantes, aunque el grado del metal duro y el recubrimiento varían según la marca.",
    },
  ],
  "fresa-endmill": [
    {
      question: "¿Qué es una fresa integral o endmill?",
      answer:
        "Una fresa integral o endmill es una herramienta rotativa de fresado con filos en la periferia y, según el tipo, también en la cara frontal. Se fabrica en una sola pieza, normalmente de metal duro (carburo) o de acero rápido (HSS).",
    },
    {
      question: "¿Cuántas flautas debe tener una fresa?",
      answer:
        "El número de flautas (filos) se elige según el material y la operación: pocas flautas (2 o 3) evacúan mejor la viruta en materiales blandos como el aluminio, mientras que más flautas (4 o más) dan mejor acabado y productividad en aceros.",
    },
    {
      question: "¿Qué diferencia hay entre una fresa integral y un cortador de insertos?",
      answer:
        "La fresa integral es de una sola pieza y se reemplaza completa cuando se desgasta; el cortador aloja insertos intercambiables que se reponen por separado. Las fresas integrales dominan en diámetros pequeños y los cortadores de insertos, en diámetros grandes.",
    },
  ],
  broca: [
    {
      question: "¿Qué es una broca?",
      answer:
        "Una broca es una herramienta rotativa de corte para crear o agrandar agujeros. La broca helicoidal, con dos filos y canales en hélice que evacuan la viruta, es la más común; existe en metal duro (carburo) y acero rápido (HSS).",
    },
    {
      question: "¿Qué broca se usa para acero?",
      answer:
        "Para acero se prefieren brocas de HSS o de carburo con recubrimiento (por ejemplo TiN o TiAlN), que resisten mejor el calor. El carburo permite mayores velocidades y vida en producción, mientras que el HSS es más tenaz y económico.",
    },
    {
      question: "¿Qué es una broca de inserto?",
      answer:
        "Una broca de inserto es una broca de cuerpo de acero que aloja insertos de corte intercambiables en la punta. Se usa en diámetros grandes, donde reponer solo los insertos resulta más económico que reemplazar toda la broca.",
    },
  ],
  machuelo: [
    {
      question: "¿Qué es un machuelo?",
      answer:
        "Un machuelo es la herramienta que genera roscas internas por arranque de viruta dentro de un agujero previamente taladrado. Sus filos reproducen el perfil de la rosca a medida que la herramienta avanza girando.",
    },
    {
      question: "¿Qué diámetro de barreno se necesita antes de machuelar?",
      answer:
        "El diámetro del agujero previo depende del paso y del tipo de rosca; como regla general, para rosca métrica se aproxima restando el paso al diámetro nominal, y se confirma en tablas de barrenos. Un barreno correcto evita la rotura del machuelo y asegura el porcentaje de rosca deseado.",
    },
    {
      question: "¿Cuál es la diferencia entre un machuelo para agujero pasante y uno ciego?",
      answer:
        "El machuelo para agujero pasante expulsa la viruta hacia adelante y es más productivo cuando el agujero atraviesa la pieza; el de agujero ciego evacúa la viruta hacia atrás para no acumularla en el fondo del agujero.",
    },
  ],
  cortador: [
    {
      question: "¿Qué es un cortador o cuerpo portainsertos?",
      answer:
        "En este catálogo, «cortador» agrupa los cuerpos de fresa y cortadores que alojan insertos intercambiables. El cuerpo sujeta uno o varios insertos que realizan el corte y permite reponer solo los insertos cuando se desgastan.",
    },
    {
      question: "¿Para qué se usa un cortador de insertos?",
      answer:
        "Se usa en fresado de careado, escuadrado (hombros a 90°) y ranurado, sobre todo en diámetros grandes donde una fresa integral resultaría costosa. La geometría del inserto se elige según la operación y el material.",
    },
  ],
  escariador: [
    {
      question: "¿Qué es un escariador o rima?",
      answer:
        "Un escariador (rima) es una herramienta rotativa de acabado que calibra y afina un agujero ya taladrado, mejorando su tolerancia dimensional y su acabado superficial. Remueve una pequeña cantidad de material con varios filos.",
    },
    {
      question: "¿Cuándo se usa un escariador?",
      answer:
        "Se usa cuando el agujero requiere un ajuste preciso, por ejemplo para alojar pasadores o bujes. Primero se taladra el agujero ligeramente por debajo de la medida final y luego el escariador lo lleva a la tolerancia buscada.",
    },
  ],
  "barra-mandrinar": [
    {
      question: "¿Qué es una barra de mandrinar?",
      answer:
        "Una barra de mandrinar es la herramienta que agranda y afina diámetros internos (mandrinado o boring), normalmente en torno. Lleva un inserto o filo en el extremo, y su rigidez determina la profundidad que puede alcanzar sin vibración.",
    },
    {
      question: "¿Qué relación de voladizo se recomienda al mandrinar?",
      answer:
        "Cuanto mayor es la relación entre la longitud en voladizo y el diámetro de la barra, mayor es el riesgo de vibración (chatter). Con barras de acero se suele recomendar no exceder unas 4 veces el diámetro; con barras de metal duro o antivibratorias se puede llegar más lejos.",
    },
  ],
  portaherramientas: [
    {
      question: "¿Qué es un portaherramientas?",
      answer:
        "Un portaherramientas es el elemento de sujeción que conecta la herramienta de corte con el husillo o la torreta de la máquina. Su rigidez y precisión de sujeción determinan la concentricidad, la estabilidad del corte y el acabado obtenido.",
    },
    {
      question: "¿Qué diferencia hay entre un portaherramientas de torno y uno de fresado?",
      answer:
        "El de fresado sujeta herramienta rotativa en el husillo mediante un cono (BT, HSK o CAT) con boquilla o mandril; el de torno aloja insertos o herramienta fija en la torreta mientras la pieza gira. En ambos se busca la máxima rigidez y repetibilidad.",
    },
  ],
};
