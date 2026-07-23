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
