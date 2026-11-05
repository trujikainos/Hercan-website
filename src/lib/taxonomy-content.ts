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
  /** Tabla comercial (se pinta con <MedidasTabla>). */
  medidas?: MedidasContent;
};

export type TipoContent = {
  /** Valor REAL de `tipo_herramienta` usado como scope del catálogo (scope.tipo). */
  name: string;
  /** Si se define, el catálogo se scopea por `familia` (no por tipo_herramienta).
   * Para nodos que son una familia dentro de un tipo genérico: buril/avellanador/
   * tarraja viven bajo tipo_herramienta "Cortador", distinguidos por `familia`. */
  familia?: string;
  /** H1 del hero. */
  title: string;
  metaTitle: string;
  metaDescription: string;
  intro: string[];
  bullets?: { heading: string; items: string[] }[];
  /** Tabla de medidas comercial (se pinta con <MedidasTabla>). */
  medidas?: MedidasContent;
};

/**
 * Tabla de medidas de un nodo de tienda. Cada fila puede llevar un `patron`
 * (regex sobre el título del producto) para contar cuántos modelos hay en el
 * catálogo de esa medida y enlazarlos con `buscar` (/buscar?q=…). Es distinta de
 * la tabla de la guía del blog a propósito: la de tienda es comercial (medida →
 * modelos en existencia), la de la guía es la referencia completa.
 */
export type MedidasContent = {
  titulo: string;
  intro: string;
  columnas: string[];
  /** `iso`: familia ISO 1832 (CNMG…): cuenta y enlaza como la página /iso/<código>.
   * `frase`: `buscar` se usa como frase exacta en el título (/buscar?…&frase=1). */
  filas: { celdas: string[]; patron?: string; buscar?: string; iso?: string; frase?: boolean }[];
  pie?: { href: string; texto: string };
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

export type MaterialContent = {
  /**
   * Valor EXACTO de `material_herramienta` usado como scope del catálogo
   * (scope.material). A diferencia de tipo/iso, material SÍ es faceta del sidebar:
   * la página fija el scope y OCULTA ese grupo con `hiddenFacets={["material"]}`.
   */
  name: string;
  /** H1 del hero. */
  title: string;
  metaTitle: string;
  metaDescription: string;
  intro: string[];
  bullets?: { heading: string; items: string[] }[];
};

export type CoatingContent = {
  /**
   * Valor EXACTO de `recubrimiento` usado como scope del catálogo (scope.coating).
   * Igual que material, es faceta del sidebar: la página fija el scope y OCULTA el
   * grupo con `hiddenFacets={["recubrimiento"]}`.
   */
  name: string;
  /** H1 del hero. */
  title: string;
  metaTitle: string;
  metaDescription: string;
  intro: string[];
  bullets?: { heading: string; items: string[] }[];
};

export type ParaContent = {
  /** Prefijo ISO 513 (P/M/K/N/S/H): scope (scope.para) por la 1ª letra de cada valor
   * de `material_a_maquinar` del producto. Multi-valor. */
  code: string;
  /** Etiqueta legible del grupo de material. */
  name: string;
  /** H1 del hero. */
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
    title: "Herramientas Iscar en México",
    metaTitle: "Iscar México: distribuidor de insertos y fresas | HERCAN",
    metaDescription:
      "Distribución de herramientas de corte Iscar en México: insertos, fresas y portaherramientas para torneado, fresado y perforación. Cotización B2B en HERCAN.",
    intro: [
      "Iscar es un fabricante israelí de herramientas de corte de metal y forma parte del grupo IMC (International Metalworking Companies). Su línea abarca insertos intercambiables, fresas, brocas y portaherramientas para las principales operaciones de maquinado.",
      "En HERCAN distribuimos herramental Iscar para torneado, fresado, perforación y roscado, con atención B2B para talleres, plantas e integradores en México.",
    ],
  },
  toolmex: {
    name: "Toolmex",
    title: "Herramientas Toolmex en México",
    metaTitle: "Toolmex México: distribuidor de brocas y machuelos | HERCAN",
    metaDescription:
      "Herramental industrial Toolmex en HERCAN: herramienta de corte HSS y de carburo para torno, fresado y taladrado. Amplio catálogo con cotización B2B en México.",
    intro: [
      "Toolmex es una marca de herramental industrial de corte, con herramienta de acero rápido (HSS) y de carburo para operaciones de torneado, fresado y taladrado.",
      "Es una de las líneas con mayor presencia en el catálogo de HERCAN. La distribuimos con atención B2B y disponibilidad para talleres y plantas en México.",
    ],
  },
  yg: {
    name: "YG",
    title: "Herramientas YG-1 en México",
    metaTitle: "YG-1 México: distribuidor de fresas, brocas y machuelos | HERCAN",
    metaDescription:
      "Fresas, brocas y machuelos de carburo y HSS de YG-1 en HERCAN. Herramienta de corte de alto rendimiento con cotización B2B en México.",
    intro: [
      "YG-1 es un fabricante surcoreano de herramientas de corte, reconocido por sus fresas integrales (endmills), brocas y machuelos de carburo y acero rápido (HSS).",
      "En HERCAN distribuimos herramienta YG-1 para fresado, perforación y roscado, con atención técnica B2B en México.",
    ],
  },
  palbit: {
    name: "Palbit",
    title: "Herramientas Palbit en México",
    metaTitle: "Palbit México: distribuidor de insertos de carburo | HERCAN",
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
    title: "Instrumentos Insize en México",
    metaTitle: "Insize México: distribuidor de instrumentos de medición | HERCAN",
    metaDescription:
      "Instrumentos de medición Insize en HERCAN: calibradores, micrómetros e indicadores para control dimensional. Cotización B2B en México.",
    intro: [
      "Insize es una marca de instrumentos de medición y metrología: calibradores, micrómetros, indicadores y accesorios para control dimensional.",
      "En HERCAN distribuimos instrumentos Insize para verificación e inspección en taller y laboratorio, con atención B2B en México.",
    ],
  },
  mitutoyo: {
    name: "Mitutoyo",
    title: "Instrumentos Mitutoyo en México",
    metaTitle: "Mitutoyo México: distribuidor de instrumentos de medición | HERCAN",
    metaDescription:
      "Equipos de medición de precisión Mitutoyo en HERCAN: calibradores, micrómetros e indicadores de carátula. Cotización B2B en México.",
    intro: [
      "Mitutoyo es un fabricante japonés de instrumentos de metrología y medición de precisión, como calibradores vernier, micrómetros e indicadores de carátula.",
      "En HERCAN distribuimos equipos de medición Mitutoyo para control dimensional en taller y laboratorio, con atención B2B en México.",
    ],
  },
};

// ── FAQ DE MARCAS ─────────────────────────────────────────────────────────────
// Para "[marca] México" y "distribuidor [marca]" (plan SEO, nov 2026): esas búsquedas
// las gana el sitio del fabricante y, del 4 al 8, distribuidores. Solo datos ya
// publicados en el sitio (origen de la marca, operación y envíos de HERCAN); el qué
// maneja cada marca sale del catálogo y se ve con números en la tabla por tipo.
export const BRAND_FAQS: Record<string, Faq[]> = {
  iscar: [
    {
      question: "¿Dónde comprar herramientas Iscar en México?",
      answer:
        "En HERCAN, distribuidor B2B y B2C con operación en Monterrey y Saltillo y envíos a todo México. En esta página ves los modelos Iscar con precio y existencia; lo que no esté en stock se cotiza.",
    },
    {
      question: "¿De dónde es Iscar?",
      answer:
        "Iscar es un fabricante israelí de herramientas de corte de metal y forma parte del grupo IMC (International Metalworking Companies).",
    },
    {
      question: "¿Qué herramientas Iscar maneja HERCAN?",
      answer:
        "Sobre todo insertos de torneado, fresado, roscado y ranurado, además de portaherramientas, cortadores, brocas y barras de mandrinar. En esta página está la tabla con cuántos modelos hay de cada tipo.",
    },
  ],
  toolmex: [
    {
      question: "¿Dónde comprar herramientas Toolmex en México?",
      answer:
        "En HERCAN, distribuidor B2B y B2C con operación en Monterrey y Saltillo y envíos a todo México. En esta página ves los modelos Toolmex con precio y existencia; lo que no esté en stock se cotiza.",
    },
    {
      question: "¿Qué herramientas Toolmex maneja HERCAN?",
      answer:
        "Sobre todo brocas y machuelos, además de portaherramientas, cortadores, fresas, escariadores y limas rotativas de carburo, en acero rápido (HSS) y carburo. En esta página está la tabla con cuántos modelos hay de cada tipo.",
    },
  ],
  yg: [
    {
      question: "¿Dónde comprar herramientas YG-1 en México?",
      answer:
        "En HERCAN, distribuidor B2B y B2C con operación en Monterrey y Saltillo y envíos a todo México. En esta página ves los modelos YG-1 con precio y existencia; lo que no esté en stock se cotiza.",
    },
    {
      question: "¿De dónde es YG-1?",
      answer:
        "YG-1 es un fabricante surcoreano de herramientas de corte, reconocido por sus fresas integrales (endmills), brocas y machuelos de carburo y acero rápido (HSS).",
    },
    {
      question: "¿Qué herramientas YG-1 maneja HERCAN?",
      answer:
        "Sobre todo fresas integrales (endmills), brocas y machuelos, además de insertos y escariadores. En esta página está la tabla con cuántos modelos hay de cada tipo.",
    },
  ],
  palbit: [
    {
      question: "¿Dónde comprar herramientas Palbit en México?",
      answer:
        "En HERCAN, distribuidor B2B y B2C con operación en Monterrey y Saltillo y envíos a todo México. En esta página ves los modelos Palbit con precio y existencia; lo que no esté en stock se cotiza.",
    },
    {
      question: "¿De dónde es Palbit?",
      answer:
        "Palbit es un fabricante portugués de metal duro (carburo), con insertos intercambiables y herramienta de corte para torneado, fresado y perforación.",
    },
    {
      question: "¿Qué herramientas Palbit maneja HERCAN?",
      answer:
        "Sobre todo insertos de carburo para torneado y fresado, además de cortadores y brocas. En esta página está la tabla con cuántos modelos hay de cada tipo.",
    },
  ],
  // "¿Quiénes son los distribuidores de INSIZE en México?" y "¿Cuánto cuesta el
  // calibrador Insize?" son preguntas que Google muestra para "insize mexico".
  insize: [
    {
      question: "¿Quiénes son los distribuidores de Insize en México?",
      answer:
        "HERCAN es uno de ellos: distribuye instrumentos de medición Insize, como calibradores, micrómetros e indicadores, con operación en Monterrey y Saltillo y envíos a todo México.",
    },
    {
      question: "¿Cuánto cuesta un calibrador Insize?",
      answer:
        "Depende del rango y del tipo de lectura. En esta página ves el precio y la existencia de cada instrumento Insize; si buscas otro modelo, se cotiza sobre pedido.",
    },
  ],
  mitutoyo: [
    {
      question: "¿Dónde comprar Mitutoyo en México?",
      answer:
        "En HERCAN, distribuidor B2B y B2C de equipos de medición con operación en Monterrey y Saltillo y envíos a todo México. En esta página ves los instrumentos Mitutoyo en existencia, con precio.",
    },
    {
      question: "¿De dónde es Mitutoyo?",
      answer:
        "Mitutoyo es un fabricante japonés de instrumentos de metrología y medición de precisión, como calibradores vernier, micrómetros e indicadores de carátula.",
    },
    {
      question: "¿Consiguen vernier y micrómetros Mitutoyo?",
      answer:
        "Sí. Lo que está en existencia aparece en esta página; si buscas un modelo Mitutoyo que no ves, como un vernier o un micrómetro, se cotiza sobre pedido.",
    },
  ],
};

// ── CATEGORÍAS ────────────────────────────────────────────────────────────────
// Claves = slug de categoría. `name` = product_type real (para el scope). El orden
// de inserción alimenta la franja de "otras categorías" y el sitemap. Cubre las 9
// categorías del negocio (incluye Accesorios/Ranurado/Abrasivos, aún sin volumen
// en el catálogo actual → forward-compatible).
export const CATEGORY_CONTENT: Record<string, CategoryContent> = {
  fresado: {
    name: "Fresado",
    // Término comercial ("herramientas para fresadora"), no el informativo ("fresado").
    title: "Herramientas para fresadora",
    metaTitle: "Herramientas para fresadora: fresas, cortadores e insertos | HERCAN",
    metaDescription:
      "Herramientas para fresadora en HERCAN: fresas integrales (endmills), cortadores con insertos, insertos de fresado y cabezales de careado para fresadora convencional y CNC. Filtra por marca, material y recubrimiento.",
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
    // Término comercial ("herramientas para torno"); "torneado" lo ganan Wikipedia y Sandvik.
    title: "Herramientas para torno",
    metaTitle: "Herramientas para torno: insertos, buriles y portaherramientas | HERCAN",
    metaDescription:
      "Herramientas para torno en HERCAN: insertos de carburo, buriles, portaherramientas y barras de mandrinar para torno convencional y CNC. Filtra por marca y material; cotización B2B y B2C.",
    intro: [
      "El torneado es una operación en la que la pieza gira sobre su eje mientras una herramienta de un solo filo remueve material, normalmente en un torno. Permite generar superficies cilíndricas y cónicas con buena precisión.",
      "Se realiza con insertos intercambiables montados en portaherramientas y con barras de mandrinar para operaciones en el interior de la pieza.",
    ],
    bullets: [
      {
        heading: "Herramientas típicas",
        items: ["Insertos de torneado", "Buriles", "Portaherramientas", "Barras de mandrinar"],
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
    metaTitle: "Perforación y taladrado: brocas, brocas de inserto y escariadores | HERCAN",
    metaDescription:
      "Herramienta de perforación y taladrado en HERCAN: brocas para metal de carburo y HSS, brocas de inserto, avellanadores y escariadores para CNC. Cotización B2B.",
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
    title: "Herramientas para roscar",
    metaTitle: "Herramientas para roscar: machuelos, tarrajas y fresas | HERCAN",
    metaDescription:
      "Herramientas para roscar en HERCAN: machuelos, tarrajas (dados de roscar), fresas de roscar e insertos de roscado para roscas internas y externas, métricas y en pulgada. Filtra por marca y material.",
    intro: [
      "El roscado es la generación de roscas internas o externas sobre una pieza. Por arranque de viruta se realiza con machuelos, fresas de roscar e insertos de roscado; también existe el roscado por conformado.",
      "La herramienta se elige según el tipo de rosca, el material a maquinar y si la rosca es interior o exterior.",
    ],
    bullets: [
      {
        heading: "Herramientas típicas",
        items: ["Machuelos", "Tarrajas (dados de roscar)", "Fresas de roscar", "Insertos de roscado"],
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
    // "para CNC" en el H1: "portaherramientas" a secas también es el cinturón o la
    // bolsa de herramientas (Home Depot, Klein en el top 6, nov 2026).
    title: "Portaherramientas para CNC",
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
    // Lo que hay en esta categoría (nov 2026) son 41 limas rotativas de carburo, no
    // discos ni muelas: la página se titula por lo que vende. "lima rotativa" 1,000/mes,
    // "limas rotativas" 390, "limas rotativas para metal" 170 (México).
    title: "Limas rotativas de carburo",
    metaTitle: "Limas rotativas de carburo para metal | HERCAN",
    metaDescription:
      "Limas rotativas (fresas rotativas) de carburo de tungsteno en HERCAN: cabezas cilíndrica, esférica, de árbol, flama y cónica, de 1/8\" a 5/8\", para desbarbar y dar forma a metal. Cotización B2B y B2C.",
    intro: [
      "Una lima rotativa (también llamada fresa rotativa) de carburo es una herramienta con cabeza de carburo de tungsteno que gira a alta velocidad, montada en un esmeril recto o rectificador, para desbarbar, rebajar, dar forma y ajustar agujeros en metal.",
      "La forma de la cabeza se identifica con un código de dos letras (SB, SC, SD…): cilíndrica, esférica, ovalada, de árbol, de flama o cónica. En HERCAN hay limas rotativas de 1/8\" a 5/8\" de diámetro de cabeza.",
    ],
    bullets: [
      {
        heading: "Formas más comunes",
        items: ["Cilíndrica (SB, SC)", "Esférica (SD)", "Árbol (SF, SG)", "Flama (SH)", "Cónica (SL, SM)"],
      },
      {
        heading: "Usos",
        items: ["Desbarbado", "Rebaje y forma", "Ajuste de agujeros"],
      },
    ],
    // Códigos de forma de la nomenclatura estándar de limas rotativas (SA a SN).
    medidas: {
      titulo: "Formas de lima rotativa por código",
      intro:
        "Cada forma de cabeza tiene su código de dos letras; el número que sigue (SB-1, SB-3…) es la medida. Estas son las formas que hay en el catálogo y cuántos modelos de cada una.",
      columnas: ["Código", "Forma de la cabeza"],
      filas: [
        { celdas: ["SB", "Cilíndrica con corte en la punta"], patron: "Rotativa.*\\bSB-\\d", buscar: "rotativa sb-" },
        { celdas: ["SC", "Cilíndrica con punta redonda"], patron: "Rotativa.*\\bSC-\\d", buscar: "rotativa sc-" },
        { celdas: ["SD", "Esférica (bola)"], patron: "Rotativa.*\\bSD-\\d", buscar: "rotativa sd-" },
        { celdas: ["SE", "Ovalada"], patron: "Rotativa.*\\bSE-\\d", buscar: "rotativa se-" },
        { celdas: ["SF", "Árbol con punta redonda"], patron: "Rotativa.*\\bSF-\\d", buscar: "rotativa sf-" },
        { celdas: ["SG", "Árbol con punta aguda"], patron: "Rotativa.*\\bSG-\\d", buscar: "rotativa sg-" },
        { celdas: ["SH", "Flama"], patron: "Rotativa.*\\bSH-\\d", buscar: "rotativa sh-" },
        { celdas: ["SL", "Cónica con punta redonda"], patron: "Rotativa.*\\bSL-\\d", buscar: "rotativa sl-" },
        { celdas: ["SM", "Cónica con punta aguda"], patron: "Rotativa.*\\bSM-\\d", buscar: "rotativa sm-" },
      ],
      pie: {
        href: "/blog/carburo-de-tungsteno-que-es",
        texto: "Qué es el carburo de tungsteno y por qué corta metal",
      },
    },
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
    // Resoluciones y usos de las guías verificadas (vernier, micrómetro, indicador).
    medidas: {
      titulo: "Qué instrumento de medición usar",
      intro:
        "Los tres instrumentos básicos del taller, cuánto resuelven y para qué se usa cada uno. Para tolerancias finas, micrómetro; para trabajo general, vernier; para comparar contra una referencia, indicador.",
      columnas: ["Instrumento", "Resolución típica", "Qué mide", "Cuándo usarlo"],
      filas: [
        { celdas: ["Vernier (calibrador pie de rey)", "0.01 a 0.02 mm", "Exterior, interior, profundidad y escalón; rangos de 0-150 a 0-300 mm", "Trabajo general del taller"] },
        { celdas: ["Micrómetro", "0.01 mm; 0.001 mm en modelos de precisión", "Exteriores por tramos de 25 mm; también hay de interiores y de profundidad", "Tolerancias finas"] },
        { celdas: ["Indicador de carátula", "0.01 mm; 0.001 mm en modelos finos", "Diferencias contra una referencia: concentricidad, planitud y paralelismo", "Reglaje de máquinas y centrado de piezas"] },
      ],
      pie: {
        href: "/blog/como-usar-un-micrometro",
        texto: "Micrómetro o vernier: cuándo conviene cada uno",
      },
    },
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
    title: "Insertos para torno y fresado",
    metaTitle: "Insertos de carburo para torno y fresado (ISO) | HERCAN",
    metaDescription:
      "Insertos (plaquitas) de corte intercambiables en HERCAN: de carburo para torneado, fresado y perforación, por designación ISO (CNMG, TNMG, DNMG…). Filtra por marca, material y recubrimiento.",
    intro: [
      "Un inserto (o plaquita) es la pieza de corte intercambiable que se sujeta mecánicamente en un portaherramientas o en el cuerpo de una fresa. Cuando un filo se desgasta, el inserto se indexa a un filo nuevo o se reemplaza, sin reafilar la herramienta.",
      "La mayoría son de carburo (metal duro), con frecuencia recubiertos (TiAlN, TiCN). Su forma y medidas están normalizadas por ISO 1832 —de ahí las designaciones tipo CNMG, TNMG o DNMG—, lo que permite intercambiarlos entre fabricantes.",
    ],
    bullets: [
      {
        heading: "Operaciones",
        items: ["Torneado", "Fresado", "Perforación", "Ranurado y roscado"],
      },
      {
        heading: "Designaciones comunes",
        items: ["CNMG", "TNMG", "DNMG", "WNMG", "CCMT / DCMT"],
      },
    ],
    // Formas y usos: tabla verificada de la guía de insertos (ISO 1832).
    medidas: {
      titulo: "Códigos de inserto más usados",
      intro:
        "Las designaciones ISO que más se piden, qué forma tienen y para qué se usan, con cuántos modelos hay de cada una en el catálogo. La primera letra es la forma del inserto y la segunda, su ángulo de incidencia.",
      columnas: ["Código ISO", "Forma", "Uso típico"],
      filas: [
        { celdas: ["CNMG", "Rombo 80°, negativo", "Torneado general, desbaste y semiacabado"], iso: "CNMG" },
        { celdas: ["DNMG", "Rombo 55°, negativo", "Perfilado y copiado en espacios reducidos"], iso: "DNMG" },
        { celdas: ["TNMG", "Triángulo 60°, negativo", "Torneado general y refrentado"], iso: "TNMG" },
        { celdas: ["WNMG", "Trigón 80°, negativo", "Torneado con más filos utilizables por cara"], iso: "WNMG" },
        { celdas: ["SNMG", "Cuadrado 90°, negativo", "Torneado a 90°, refrentado y ranurado ligero"], iso: "SNMG" },
        { celdas: ["VNMG", "Rombo 35°, negativo", "Copiado y perfiles con ángulos cerrados"], iso: "VNMG" },
        { celdas: ["CCMT", "Rombo 80°, positivo", "Acabado fino en inoxidables y piezas delgadas"], iso: "CCMT" },
        { celdas: ["DCMT", "Rombo 55°, positivo", "Acabado en espacios reducidos"], iso: "DCMT" },
        { celdas: ["APMT", "Positivo para fresado", "Fresado de careado y hombros"], iso: "APMT" },
      ],
      pie: {
        href: "/blog/insertos-de-carburo-guia",
        texto: "Cómo leer el código ISO completo de un inserto (las 7 posiciones)",
      },
    },
  },
  "fresa-endmill": {
    name: "Fresa/Endmill",
    // "para metal": "fresas de carburo" a secas la ganan tiendas dentales (nov 2026).
    title: "Fresas de carburo para metal (endmills)",
    metaTitle: "Fresas endmill de carburo y HSS para metal y CNC | HERCAN",
    metaDescription:
      "Fresas integrales o endmills en HERCAN: de carburo y HSS para ranurado, contorneado y refrentado en CNC, para acero, inoxidable y aluminio. Filtra por marca, material y recubrimiento.",
    intro: [
      "Una fresa de carburo integral o endmill es una herramienta rotativa de fresado con filos en la periferia y, según el tipo, también en la cara frontal. Se fabrica en una sola pieza, normalmente de carburo (metal duro) o acero rápido (HSS).",
      "Se usa para ranurar, contornear, refrentar hombros y perfilar en fresadoras y centros de maquinado CNC, en acero, inoxidable y aluminio. El número de filos (flautas) y el ángulo de hélice se eligen según el material y el tipo de corte.",
    ],
    bullets: [
      {
        heading: "Operaciones",
        items: ["Ranurado", "Contorneado", "Refrentado de hombros", "Perfilado"],
      },
      {
        heading: "Para qué metal",
        items: ["Acero (ISO P)", "Acero inoxidable (ISO M)", "Aluminio y no ferrosos (ISO N)"],
      },
    ],
    // Geometrías: tabla verificada de la guía de fresas de carburo.
    medidas: {
      titulo: "Tipos de fresa por la forma de la punta",
      intro:
        "La forma de la punta define qué superficie deja la fresa. Estas son las geometrías de uso común y cuántos modelos hay de cada una en el catálogo.",
      columnas: ["Geometría", "También se llama", "Para qué se usa"],
      filas: [
        { celdas: ["Plana", "Testa plana, escuadra (square end)", "Escuadrado a 90°, ranurado y cajeado de paredes rectas"], patron: "Endmill.*\\bplano\\b", buscar: "endmill plano" },
        { celdas: ["Bola", "Punta esférica (ball nose)", "Superficies 3D, moldes, matrices y contornos suaves"], patron: "Endmill.*\\bbola\\b", buscar: "endmill bola" },
        { celdas: ["Radio o toroidal", "Bull nose", "Desbaste robusto y acabado con menos marca de herramienta"], patron: "Endmill.*toroidal", buscar: "endmill toroidal" },
        { celdas: ["Chaflán", "Achaflanadora", "Biseles, desbarbado y romper aristas vivas"], patron: "Endmill.*chafl[aá]n", buscar: "endmill chaflan" },
      ],
      pie: {
        href: "/blog/fresas-de-carburo-guia",
        texto: "Guía: cuántas flautas y qué recubrimiento usar según el material",
      },
    },
  },
  broca: {
    name: "Broca",
    title: "Brocas para metal",
    metaTitle: "Brocas para metal: carburo, HSS y cobalto | HERCAN",
    metaDescription:
      "Brocas para metal en HERCAN: HSS, cobalto (M35/M42), carburo y de inserto para acero, inoxidable y aluminio. Filtra por marca, material y recubrimiento; cotización B2B y B2C en México.",
    intro: [
      "Las brocas para metal se eligen sobre todo por el material que vas a perforar: HSS para acero suave, aluminio y latón; cobalto (M35/M42) para acero inoxidable y aceros duros; y carburo de tungsteno para producción en CNC y aceros endurecidos. Para diámetros grandes existen además las brocas de inserto intercambiable.",
      "La broca helicoidal —dos filos y canales en hélice que evacúan la viruta— es la más común. El ángulo de punta (118° para uso general, 135° para metal duro) y el recubrimiento (TiN, TiAlN) definen la penetración y la vida de la herramienta. Filtra por marca, material y recubrimiento para dar con la geometría exacta.",
    ],
    bullets: [
      {
        heading: "Por material de la broca",
        items: ["HSS (acero rápido)", "Cobalto M35/M42", "Carburo de tungsteno", "De inserto intercambiable"],
      },
      {
        heading: "Para qué metal",
        items: ["Acero (ISO P)", "Acero inoxidable (ISO M)", "Aluminio y no ferrosos (ISO N)", "Fundición (ISO K)"],
      },
    ],
    // Equivalencias exactas (1 pulgada = 25.4 mm). Responde búsquedas reales de GSC
    // como "broca 3 16 a mm" y "broca de 3 8 a mm".
    medidas: {
      titulo: "Medidas de brocas en pulgadas y su equivalencia en milímetros",
      intro:
        "Las brocas fraccionales más pedidas con su medida exacta en milímetros (1 pulgada = 25.4 mm) y cuántos modelos hay de cada una en el catálogo.",
      columnas: ["Broca (pulgadas)", "Milímetros", "Pulgadas en decimal"],
      filas: [
        { celdas: ['1/16"', "1.59 mm", '0.0625"'], patron: '^Broca\\s+1/16"', buscar: 'broca 1/16"', frase: true },
        { celdas: ['1/8"', "3.18 mm", '0.125"'], patron: '^Broca\\s+1/8"', buscar: 'broca 1/8"', frase: true },
        { celdas: ['5/32"', "3.97 mm", '0.1563"'], patron: '^Broca\\s+5/32"', buscar: 'broca 5/32"', frase: true },
        { celdas: ['3/16"', "4.76 mm", '0.1875"'], patron: '^Broca\\s+3/16"', buscar: 'broca 3/16"', frase: true },
        { celdas: ['7/32"', "5.56 mm", '0.2188"'], patron: '^Broca\\s+7/32"', buscar: 'broca 7/32"', frase: true },
        { celdas: ['1/4"', "6.35 mm", '0.25"'], patron: '^Broca\\s+1/4"', buscar: 'broca 1/4"', frase: true },
        { celdas: ['5/16"', "7.94 mm", '0.3125"'], patron: '^Broca\\s+5/16"', buscar: 'broca 5/16"', frase: true },
        { celdas: ['3/8"', "9.53 mm", '0.375"'], patron: '^Broca\\s+3/8"', buscar: 'broca 3/8"', frase: true },
        { celdas: ['7/16"', "11.11 mm", '0.4375"'], patron: '^Broca\\s+7/16"', buscar: 'broca 7/16"', frase: true },
        { celdas: ['1/2"', "12.70 mm", '0.5"'], patron: '^Broca\\s+1/2"', buscar: 'broca 1/2"', frase: true },
      ],
      pie: {
        href: "/blog/brocas-para-metal-guia",
        texto: "Guía: qué broca usar según el metal y a cuántas RPM",
      },
    },
  },
  machuelo: {
    name: "Machuelo",
    title: "Machuelos para roscar",
    metaTitle: "Machuelos para roscar: métricos, HSS y carburo | HERCAN",
    metaDescription:
      "Machuelos para roscado interno en HERCAN: métricos y en pulgada, HSS y de carburo, para agujero pasante y ciego. Por pieza y en juego; cotización B2B y B2C en México.",
    intro: [
      "Un machuelo es la herramienta que genera roscas internas por arranque de viruta dentro de un agujero previamente taladrado. Sus filos reproducen el perfil de la rosca a medida que la herramienta avanza girando.",
      "Hay machuelos métricos y en pulgada, de acero rápido (HSS) y de metal duro, con variantes para agujero pasante o ciego según cómo evacuen la viruta. El diámetro del barreno previo depende del paso y el tipo de rosca (consulta la tabla broca–machuelo).",
    ],
    bullets: [
      {
        heading: "Por tipo de rosca / uso",
        items: ["Métrico", "En pulgada (UNC / UNF / NPT)", "Agujero pasante", "Agujero ciego"],
      },
      {
        heading: "Material",
        items: ["HSS (acero rápido)", "Carburo"],
      },
    ],
    // Brocas tomadas de la tabla verificada de la guía (julio 2026). Aquí van solo
    // las medidas más pedidas con su conteo en catálogo; la tabla completa vive en la guía.
    medidas: {
      titulo: "Medidas de machuelos y broca para cada rosca",
      intro:
        "Las medidas más pedidas, con el diámetro de broca para el barreno previo y cuántos modelos hay de cada una en el catálogo.",
      columnas: ["Machuelo", "Broca para el barreno", "Uso típico"],
      filas: [
        { celdas: ["M3 x 0.5", "2.5 mm", "Tapas, placas, electrónica"], patron: "^Machuelo\\s+M3\\s*x\\s*0?\\.5\\b", buscar: "machuelo M3x0.5", frase: true },
        { celdas: ["M4 x 0.7", "3.3 mm", "Ensambles ligeros, moldes"], patron: "^Machuelo\\s+M4\\s*x\\s*0?\\.7\\b", buscar: "machuelo M4x0.7", frase: true },
        { celdas: ["M5 x 0.8", "4.2 mm", "Uso general en taller"], patron: "^Machuelo\\s+M5\\s*x\\s*0?\\.8\\b", buscar: "machuelo M5x0.8", frase: true },
        { celdas: ["M6 x 1.0", "5.0 mm", "Uso general, la medida más común"], patron: "^Machuelo\\s+M6\\s*x\\s*1(\\.0+)?\\b", buscar: "machuelo M6x1", frase: true },
        { celdas: ["M8 x 1.25", "6.8 mm", "Estructuras, maquinaria"], patron: "^Machuelo\\s+M8\\s*x\\s*1\\.25\\b", buscar: "machuelo M8x1.25", frase: true },
        { celdas: ["M10 x 1.5", "8.5 mm", "Maquinaria media, bridas"], patron: "^Machuelo\\s+M10\\s*x\\s*1\\.5\\b", buscar: "machuelo M10x1.5", frase: true },
        { celdas: ["M12 x 1.75", "10.2 mm", "Maquinaria pesada"], patron: "^Machuelo\\s+M12\\s*x\\s*1\\.75\\b", buscar: "machuelo M12x1.75", frase: true },
        { celdas: ['1/4"-20 UNC', "#7 (5.1 mm)", "Tornillería en pulgada"], patron: '^Machuelo\\s+1/4"?\\s*-\\s*20\\b', buscar: 'machuelo 1/4"-20', frase: true },
        { celdas: ['5/16"-18 UNC', "F (6.5 mm)", "Tornillería en pulgada"], patron: '^Machuelo\\s+5/16"?\\s*-\\s*18\\b', buscar: 'machuelo 5/16"-18', frase: true },
        { celdas: ['3/8"-16 UNC', '5/16" (7.9 mm)', "Tornillería en pulgada"], patron: '^Machuelo\\s+3/8"?\\s*-\\s*16\\b', buscar: 'machuelo 3/8"-16', frase: true },
        { celdas: ['1/2"-13 UNC', '27/64" (10.7 mm)', "Tornillería en pulgada"], patron: '^Machuelo\\s+1/2"?\\s*-\\s*13\\b', buscar: 'machuelo 1/2"-13', frase: true },
      ],
      pie: {
        href: "/blog/machuelos-para-roscar-guia",
        texto: "Ver la tabla completa broca-machuelo (M3 a M20, UNC y UNF)",
      },
    },
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
    // "para metal (rimas)": "escariador" a secas mezcla el dental y el de tubería (nov 2026).
    title: "Escariadores para metal (rimas)",
    metaTitle: "Escariadores (rimas) para metal: HSS, cobalto y carburo | HERCAN",
    metaDescription:
      "Escariadores (rimas) para metal en HERCAN: de acero rápido (HSS), cobalto y carburo, en medidas métricas y en pulgada, para calibrar y afinar agujeros a tolerancia estrecha. Cotización B2B y B2C.",
    intro: [
      "Un escariador (rima) es una herramienta rotativa de acabado que calibra y afina un agujero ya taladrado, mejorando su tolerancia dimensional y su acabado superficial. Remueve una pequeña cantidad de material con varios filos.",
      "Se emplea cuando el agujero requiere un ajuste preciso, por ejemplo para alojar pasadores o bujes. Existen escariadores de acero rápido (HSS), cobalto y metal duro.",
    ],
    bullets: [
      {
        heading: "Aplicaciones",
        items: ["Calibrado de agujeros", "Acabado de precisión"],
      },
    ],
    // Equivalencias exactas (1 pulgada = 25.4 mm); conteo = resultados de /buscar.
    medidas: {
      titulo: "Medidas de escariador",
      intro:
        "Las medidas más pedidas, su equivalencia exacta y cuántos modelos hay de cada una en el catálogo (1 pulgada = 25.4 mm).",
      columnas: ["Escariador", "Equivalencia"],
      filas: [
        { celdas: ['1/8"', "3.18 mm"], patron: '^Escariador\\s+1/8"', buscar: 'escariador 1/8"', frase: true },
        { celdas: ['3/16"', "4.76 mm"], patron: '^Escariador\\s+3/16"', buscar: 'escariador 3/16"', frase: true },
        { celdas: ['1/4"', "6.35 mm"], patron: '^Escariador\\s+1/4"', buscar: 'escariador 1/4"', frase: true },
        { celdas: ['5/16"', "7.94 mm"], patron: '^Escariador\\s+5/16"', buscar: 'escariador 5/16"', frase: true },
        { celdas: ['3/8"', "9.53 mm"], patron: '^Escariador\\s+3/8"', buscar: 'escariador 3/8"', frase: true },
        { celdas: ['1/2"', "12.70 mm"], patron: '^Escariador\\s+1/2"', buscar: 'escariador 1/2"', frase: true },
        { celdas: ['5/8"', "15.88 mm"], patron: '^Escariador\\s+5/8"', buscar: 'escariador 5/8"', frase: true },
        { celdas: ['3/4"', "19.05 mm"], patron: '^Escariador\\s+3/4"', buscar: 'escariador 3/4"', frase: true },
        { celdas: ["6 mm", '0.236"'], patron: "^Escariador\\s+6\\s*mm", buscar: "escariador 6mm", frase: true },
        { celdas: ["8 mm", '0.315"'], patron: "^Escariador\\s+8\\s*mm", buscar: "escariador 8mm", frase: true },
        { celdas: ["10 mm", '0.394"'], patron: "^Escariador\\s+10\\s*mm", buscar: "escariador 10mm", frase: true },
        { celdas: ["12 mm", '0.472"'], patron: "^Escariador\\s+12\\s*mm", buscar: "escariador 12mm", frase: true },
        { celdas: ["16 mm", '0.630"'], patron: "^Escariador\\s+16\\s*mm", buscar: "escariador 16mm", frase: true },
      ],
    },
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
  buril: {
    name: "Buril",
    familia: "Buril",
    title: "Buriles para torno",
    metaTitle: "Buriles para torno: HSS, cobalto y calzados con carburo | HERCAN",
    metaDescription:
      "Buriles para torno en HERCAN: cuadrados de HSS y cobalto y calzados con punta de carburo, de 1/4\" a 3/4\", para cilindrar, refrentar, ranurar y roscar. Por pieza; cotización B2B y B2C en México.",
    intro: [
      "Un buril es la herramienta de corte de un solo filo que se monta en la torreta del torno para cilindrar, refrentar, ranurar o roscar. Se afila según la operación y el material, y define en buena medida el acabado de la pieza.",
      "Los hay de acero rápido (HSS) y HSS con cobalto, cuadrados o de forma; calzados, con punta de carburo soldada; y con inserto de carburo intercambiable. La sección del cuerpo (zanco) se elige por la altura de centros del torno.",
    ],
    bullets: [
      {
        heading: "Por tipo",
        items: ["Buril cuadrado HSS", "Buril de forma", "Calzado con carburo", "Con inserto de carburo"],
      },
      {
        heading: "Operaciones",
        items: ["Cilindrado", "Refrentado", "Ranurado", "Roscado"],
      },
    ],
    // Tipos por operación: tabla verificada de la guía de buriles. Sin conteo: la
    // búsqueda del sitio no distingue 1/2" de "2 1/2"" (largo del buril).
    medidas: {
      titulo: "Tipos de buril según la operación",
      intro:
        "Cada operación pide una forma y un ángulo distintos en la punta. Estos son los tipos de buril de uso común en el torno.",
      columnas: ["Tipo de buril", "Operación", "Ángulo orientativo"],
      filas: [
        { celdas: ["Recto de desbaste", "Desbaste y cilindrado grueso", "Posición de unos 45° a 60°"] },
        { celdas: ["Recto de acabado", "Acabado y cilindrado fino", "Posición de unos 90° a 95°"] },
        { celdas: ["Refrentador", "Refrentado de caras", "Punta de unos 55° a 72°"] },
        { celdas: ["Tronzador o ranurador", "Tronzado y ranurado", "Hoja de 1.5 a 6 mm de ancho"] },
        { celdas: ["Roscador", "Roscado externo o interno", "60° métrica, 55° Whitworth"] },
        { celdas: ["De mandrinar", "Mandrinado interior", "Posición de unos 90° a 95°"] },
        { celdas: ["Redondo o de forma", "Copiado y perfiles cóncavos", "Radio según el perfil del plano"] },
      ],
      pie: {
        href: "/blog/buriles-para-torno-guia",
        texto: "Guía: geometría del buril, ángulos de corte y cómo afilarlo",
      },
    },
  },
  avellanador: {
    name: "Avellanador",
    familia: "Avellanador",
    title: "Avellanadores para metal",
    metaTitle: "Avellanadores para metal: 60°, 82° y 90° HSS | HERCAN",
    metaDescription:
      "Avellanadores para metal en HERCAN: de HSS a 60°, 82° y 90°, de 1, 3 y 6 filos, para avellanar, desbarbar y alojar tornillos de cabeza avellanada. Cotización B2B y B2C en México.",
    intro: [
      "Un avellanador es la herramienta que abre un chaflán cónico en la boca de un agujero, para alojar la cabeza de un tornillo avellanado o para desbarbar. El ángulo típico es 82° (pulgada) o 90° (métrico).",
      "Se usan en acero rápido (HSS), de uno o varios filos, y se trabajan a baja velocidad para un chaflán limpio sin traqueteo. El diámetro mayor define hasta qué tamaño de tornillo se puede alojar.",
    ],
    bullets: [
      {
        heading: "Por ángulo",
        items: ["60° (desbarbado)", "82° (pulgada)", "90° (métrico)"],
      },
      {
        heading: "Por número de filos",
        items: ["1 filo (corte rápido)", "3 filos (el más vendido)", "6 filos (mejor acabado)"],
      },
    ],
    // Ángulos y aplicaciones de la tabla verificada de la guía de avellanadores.
    medidas: {
      titulo: "Qué ángulo de avellanador usar",
      intro:
        "El ángulo del avellanador debe coincidir con la cabeza del tornillo o con el trabajo que vas a hacer. Estos son los cinco ángulos de uso común y cuántos modelos hay de cada uno en el catálogo.",
      columnas: ["Ángulo", "Para qué se usa", "Contexto típico"],
      filas: [
        { celdas: ["60°", "Desbarbado general de agujeros, sin tornillo", "Uso universal de taller"], patron: "avellanador.*\\b60°", buscar: "avellanador 60°" },
        { celdas: ["82°", "Tornillos de cabeza plana en pulgada (UNC/UNF)", "Tornillería americana (ANSI), equipo importado de EE. UU."], patron: "avellanador.*\\b82°", buscar: "avellanador 82°" },
        { celdas: ["90°", "Tornillos de cabeza plana métrica", "Tornillería métrica DIN/ISO, la más común en México"], patron: "avellanador.*\\b90°", buscar: "avellanador 90°" },
        { celdas: ["100°", "Tornillos y remaches avellanados aeronáuticos", "Aeroespacial, lámina delgada"], patron: "avellanador.*\\b100°", buscar: "avellanador 100°" },
        { celdas: ["120°", "Remaches en lámina gruesa, tornillo autoperforante", "Remachado y lámina industrial"], patron: "avellanador.*\\b120°", buscar: "avellanador 120°" },
      ],
      pie: {
        href: "/blog/avellanadores-guia",
        texto: "Guía: tipos de avellanador, número de filos y a qué velocidad trabajarlo",
      },
    },
  },
  tarraja: {
    name: "Tarraja",
    familia: "Dado (Tarraja)",
    title: "Tarrajas y dados de roscar",
    metaTitle: "Tarrajas (dados de roscar): métricas y en pulgada | HERCAN",
    metaDescription:
      "Tarrajas o dados de roscar en HERCAN: para roscas externas métricas y en pulgada (UNC/UNF) en HSS. Por pieza y en juego; cotización B2B y B2C en México.",
    intro: [
      "Una tarraja (o dado de roscar) es la herramienta que genera roscas externas sobre una barra o tornillo por arranque de viruta. Es la contraparte del machuelo, que hace la rosca interna.",
      "Las hay métricas y en pulgada (UNC/UNF), normalmente de acero rápido (HSS), y se giran con un desterrajador (portaterrajas). El diámetro de la varilla debe ajustarse al de la rosca para un corte limpio.",
    ],
    bullets: [
      {
        heading: "Por tipo de rosca",
        items: ["Métrica", "En pulgada (UNC / UNF)"],
      },
      {
        heading: "Uso",
        items: ["Roscas externas", "Se usa con desterrajador (portaterrajas)"],
      },
    ],
    // Varilla: tabla verificada de la guía (métrica) y su regla para pulgada (barra al
    // diámetro nominal). #10 = 0.190" es el diámetro nominal del número 10.
    medidas: {
      titulo: "Medidas de tarrajas y diámetro de varilla",
      intro:
        "Las medidas más pedidas, con el diámetro de la varilla antes de roscar y cuántos modelos hay de cada una en el catálogo. La varilla va igual o ligeramente menor al diámetro nominal, nunca mayor.",
      columnas: ["Tarraja", "Sistema de rosca", "Varilla antes de roscar"],
      filas: [
        { celdas: ["M6 x 1.0", "Métrica, paso grueso", "5.88 a 5.94 mm"], patron: "TARRAJA\\s+(IZQ\\.\\s*)?M6\\s*x\\s*1(\\.0+)?(?![.\\d])", buscar: "tarraja M6x1", frase: true },
        { celdas: ["M8 x 1.25", "Métrica, paso grueso", "7.85 a 7.92 mm"], patron: "TARRAJA\\s+(IZQ\\.\\s*)?M8\\s*x\\s*1\\.25", buscar: "tarraja M8 x 1.25", frase: true },
        { celdas: ["M10 x 1.5", "Métrica, paso grueso", "9.80 a 9.90 mm"], patron: "TARRAJA\\s+(IZQ\\.\\s*)?M10\\s*x\\s*1\\.5(?!\\d)", buscar: "tarraja M10x1.5", frase: true },
        { celdas: ["M12 x 1.75", "Métrica, paso grueso", "11.80 a 11.90 mm"], patron: "TARRAJA\\s+(IZQ\\.\\s*)?M12\\s*x\\s*1\\.75", buscar: "tarraja M12 x 1.75", frase: true },
        { celdas: ["#10-24", "UNC (pulgada, paso grueso)", '#10 (0.190")'], patron: "TARRAJA\\s+#10-24", buscar: "tarraja #10-24", frase: true },
        { celdas: ['1/4"-20', "UNC (pulgada, paso grueso)", '1/4"'], patron: 'TARRAJA\\s+1/4"?-20', buscar: 'tarraja 1/4"-20', frase: true },
        { celdas: ['3/8"-16', "UNC (pulgada, paso grueso)", '3/8"'], patron: 'TARRAJA\\s+3/8"?-16', buscar: 'tarraja 3/8"-16', frase: true },
        { celdas: ['1/2"-13', "UNC (pulgada, paso grueso)", '1/2"'], patron: 'TARRAJA\\s+1/2"?-13', buscar: 'tarraja 1/2"-13', frase: true },
        { celdas: ['5/8"-18', "UNF (pulgada, paso fino)", '5/8"'], patron: 'TARRAJA\\s+5/8"?-18', buscar: 'tarraja 5/8"-18', frase: true },
      ],
      pie: {
        href: "/blog/tarrajas-para-roscar-guia",
        texto: "Guía: tipos de tarraja, sistemas de rosca (NPT, BSP) y cómo roscar",
      },
    },
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

// ── MATERIALES DE HERRAMIENTA ─────────────────────────────────────────────────
// Claves = slug de material (del valor real de `material_herramienta`). `name` = el
// valor EXACTO usado como scope de la faceta `material`. A diferencia de tipo/iso,
// material SÍ es faceta del sidebar: la página fija el scope y OCULTA ese grupo con
// `hiddenFacets={["material"]}`. Contenido = metalurgia de corte (conocimiento
// general, factual), no marketing de fabricante. Sin FAQ (100% verificable).
export const MATERIAL_CONTENT: Record<string, MaterialContent> = {
  carburo: {
    name: "Carburo",
    title: "Herramientas de carburo",
    metaTitle: "Herramientas de carburo (metal duro) para CNC | HERCAN",
    metaDescription:
      "Fresas, brocas e insertos de carburo de tungsteno para CNC en HERCAN. Alta dureza y velocidades de corte altas. Filtra por categoría, marca y recubrimiento.",
    intro: [
      "El carburo de tungsteno (metal duro) es el material de herramienta más usado en el maquinado CNC moderno por su alta dureza y su resistencia al calor, que permiten velocidades de corte muy superiores a las del acero rápido.",
      "En HERCAN encuentras fresas, brocas, insertos y cortadores de carburo para acero, fundición y no ferrosos; combina categoría, marca y recubrimiento para dar con la geometría exacta.",
    ],
    bullets: [
      {
        heading: "Ventajas",
        items: ["Alta dureza en caliente", "Velocidades de corte altas", "Buena vida útil"],
      },
      {
        heading: "Aplicaciones",
        items: ["Fresado y torneado de producción", "Acero y fundición", "Acabados de precisión"],
      },
    ],
  },
  hss: {
    name: "HSS",
    title: "Herramientas de acero rápido (HSS)",
    metaTitle: "Herramientas HSS (acero rápido) para CNC | HERCAN",
    metaDescription:
      "Brocas, machuelos y fresas de acero rápido HSS en HERCAN. Tenaz y económico para taladrado, roscado y fresado general.",
    intro: [
      "El acero rápido (HSS, por High Speed Steel) es un acero de herramienta tenaz y económico. Su resistencia al impacto lo hace ideal para brocas, machuelos y fresas donde importa más la tenacidad que la velocidad de corte.",
      "HERCAN distribuye herramienta HSS para taladrado, roscado y fresado general; combínala con el filtro de recubrimiento (TiN, TiAlN) para más vida útil.",
    ],
    bullets: [
      {
        heading: "Ventajas",
        items: ["Tenaz y resistente al impacto", "Económico", "Reafilable"],
      },
      {
        heading: "Aplicaciones",
        items: ["Taladrado", "Roscado con machuelo", "Fresado general"],
      },
    ],
  },
  cobalto: {
    name: "Cobalto",
    title: "Herramientas de acero al cobalto (HSS-Co)",
    metaTitle: "Herramientas HSS-Co (acero al cobalto) para CNC | HERCAN",
    metaDescription:
      "Brocas y machuelos de acero rápido al cobalto (HSS-Co) en HERCAN. Más dureza en caliente para acero inoxidable y aleaciones tenaces.",
    intro: [
      "El acero rápido al cobalto (HSS-Co, típicamente 5-8% de cobalto como el grado M42) añade cobalto al acero rápido para lograr mayor dureza en caliente y resistencia al desgaste que el HSS convencional.",
      "Es la opción de HERCAN para materiales duros o abrasivos como el acero inoxidable y las aleaciones tenaces, donde el HSS estándar se desgasta rápido.",
    ],
    bullets: [
      {
        heading: "Ventajas",
        items: ["Más dureza en caliente que HSS", "Resiste materiales abrasivos", "Buen filo"],
      },
      {
        heading: "Aplicaciones",
        items: ["Acero inoxidable", "Aleaciones tenaces", "Taladrado exigente"],
      },
    ],
  },
};

// ── MATERIAL A MAQUINAR (ISO 513) — la "mina de oro" /para/[material] ─────────
// Claves = slug de la página. `code` = prefijo ISO 513 (P/M/K/N/S/H) con el que se
// hace el scope (1ª letra de cada `material_a_maquinar`). Contenido = clasificación
// ISO 513 de materiales (conocimiento técnico factual), no marketing. MULTI-VALOR:
// un producto que sirve para varios grupos aparece en varias de estas páginas.
export const PARA_CONTENT: Record<string, ParaContent> = {
  acero: {
    code: "P",
    name: "Acero",
    title: "Herramientas para acero",
    metaTitle: "Herramientas de corte para acero (ISO P) en México | HERCAN",
    metaDescription:
      "Fresas, brocas e insertos para maquinar acero (grupo ISO P) en HERCAN. Herramienta de corte para acero al carbono y aleado, con cotización B2B en México.",
    intro: [
      "El acero (grupo P de la norma ISO 513, identificado con el color azul) es el material más común en el maquinado: abarca aceros al carbono, aleados y de baja aleación. Genera viruta larga y su maquinabilidad depende de la dureza y del contenido de aleación.",
      "En HERCAN encuentras herramienta de corte para acero —insertos, fresas y brocas— de marcas como Iscar, Toolmex y YG-1. Filtra por categoría, marca, material de herramienta y recubrimiento para dar con la geometría exacta.",
    ],
    bullets: [
      {
        heading: "Recomendaciones típicas",
        items: ["Carburo recubierto (TiAlN)", "Geometrías de propósito general", "Refrigeración según la operación"],
      },
    ],
  },
  "acero-inoxidable": {
    code: "M",
    name: "Acero inoxidable",
    title: "Herramientas para acero inoxidable",
    metaTitle: "Herramientas de corte para acero inoxidable (ISO M) | HERCAN",
    metaDescription:
      "Herramienta para maquinar acero inoxidable (grupo ISO M) en HERCAN: insertos, fresas y brocas para inoxidable austenítico y dúplex. Cotización B2B en México.",
    intro: [
      "El acero inoxidable (grupo M de la norma ISO 513, color amarillo) incluye los inoxidables austeníticos, ferríticos y dúplex. Se endurece por deformación y evacua mal el calor, por lo que exige filos vivos, buena tenacidad y control del corte para evitar el endurecimiento superficial.",
      "En HERCAN distribuimos herramienta de corte apta para inoxidable, con grados y recubrimientos pensados para su tenacidad. Filtra por categoría, marca y recubrimiento.",
    ],
    bullets: [
      {
        heading: "Recomendaciones típicas",
        items: ["Filos vivos y positivos", "Grados tenaces", "Refrigeración abundante"],
      },
    ],
  },
  fundicion: {
    code: "K",
    name: "Fundición",
    title: "Herramientas para fundición",
    metaTitle: "Herramientas de corte para fundición (ISO K) en México | HERCAN",
    metaDescription:
      "Herramienta para maquinar hierro fundido (grupo ISO K) en HERCAN: insertos y fresas para fundición gris y nodular. Cotización B2B en México.",
    intro: [
      "La fundición (grupo K de la norma ISO 513, color rojo) comprende el hierro fundido gris y nodular. Produce viruta corta y es abrasiva, por lo que el desgaste de la herramienta es un factor clave; con frecuencia se maquina en seco.",
      "En HERCAN encuentras herramienta de corte para fundición con grados resistentes al desgaste. Filtra por categoría, marca, material de herramienta y recubrimiento.",
    ],
    bullets: [
      {
        heading: "Recomendaciones típicas",
        items: ["Grados resistentes al desgaste", "Corte en seco frecuente", "Geometrías robustas"],
      },
    ],
  },
  aluminio: {
    code: "N",
    name: "Aluminio y no ferrosos",
    title: "Herramientas para aluminio y no ferrosos",
    metaTitle: "Herramientas de corte para aluminio y no ferrosos (ISO N) | HERCAN",
    metaDescription:
      "Herramienta para maquinar aluminio, cobre y no ferrosos (grupo ISO N) en HERCAN: fresas e insertos de filo vivo para alta velocidad. Cotización B2B en México.",
    intro: [
      "Los no ferrosos (grupo N de la norma ISO 513, color verde) incluyen el aluminio, el cobre y sus aleaciones. Son blandos y permiten velocidades de corte muy altas, pero exigen filos muy vivos y buena evacuación de viruta para evitar el pegado del material.",
      "En HERCAN distribuimos herramienta de corte para aluminio y no ferrosos, con geometrías pulidas y positivas. Filtra por categoría, marca y recubrimiento.",
    ],
    bullets: [
      {
        heading: "Recomendaciones típicas",
        items: ["Filos vivos y pulidos", "Geometrías positivas", "Altas velocidades de corte"],
      },
    ],
  },
  superaleaciones: {
    code: "S",
    name: "Superaleaciones y titanio",
    title: "Herramientas para superaleaciones y titanio",
    metaTitle: "Herramientas para superaleaciones y titanio (ISO S) | HERCAN",
    metaDescription:
      "Herramienta para maquinar superaleaciones y titanio (grupo ISO S) en HERCAN: insertos y fresas para materiales resistentes al calor. Cotización B2B en México.",
    intro: [
      "El grupo S de la norma ISO 513 (color café) reúne las superaleaciones termorresistentes (base níquel, cobalto o hierro, como el Inconel) y las aleaciones de titanio. Son materiales difíciles de maquinar: conservan su dureza a alta temperatura y generan mucho calor en el filo.",
      "En HERCAN encontrarás herramienta de corte para estos materiales exigentes, con grados y recubrimientos de alta resistencia térmica. Filtra por categoría, marca y recubrimiento.",
    ],
    bullets: [
      {
        heading: "Recomendaciones típicas",
        items: ["Grados resistentes al calor", "Velocidades de corte bajas", "Refrigeración a presión"],
      },
    ],
  },
  endurecidos: {
    code: "H",
    name: "Materiales endurecidos",
    title: "Herramientas para materiales endurecidos",
    metaTitle: "Herramientas para acero endurecido (ISO H) en México | HERCAN",
    metaDescription:
      "Herramienta para el torneado y fresado de aceros endurecidos (grupo ISO H) en HERCAN. Insertos para materiales de alta dureza (>45 HRC). Cotización B2B.",
    intro: [
      "El grupo H de la norma ISO 513 (color gris) corresponde a los materiales endurecidos: aceros templados y endurecidos por encima de unos 45 HRC, además de fundiciones duras. Se maquinan en operaciones de corte duro (hard turning), muchas veces como alternativa al rectificado.",
      "En HERCAN distribuimos herramienta de corte para materiales endurecidos, con grados de alta dureza. Filtra por categoría, marca y recubrimiento.",
    ],
    bullets: [
      {
        heading: "Recomendaciones típicas",
        items: ["Grados de alta dureza (CBN)", "Geometrías negativas robustas", "Corte estable y rígido"],
      },
    ],
  },
};

// ── RECUBRIMIENTOS ────────────────────────────────────────────────────────────
// Claves = slug de recubrimiento (del valor real de `recubrimiento`). `name` = el
// valor EXACTO usado como scope de la faceta `coating`. Igual que material, es faceta
// del sidebar: la página fija el scope y OCULTA el grupo con
// `hiddenFacets={["recubrimiento"]}`. Contenido = tribología de recubrimientos de
// corte (factual). Sin FAQ (100% verificable).
export const RECUBRIMIENTO_CONTENT: Record<string, CoatingContent> = {
  tialn: {
    name: "TiAlN",
    title: "Herramientas con recubrimiento TiAlN",
    metaTitle: "Recubrimiento TiAlN (nitruro de titanio-aluminio) | HERCAN",
    metaDescription:
      "Herramienta con recubrimiento TiAlN para corte en seco y alta velocidad en acero y fundición. Fresas, brocas e insertos en HERCAN.",
    intro: [
      "El TiAlN (nitruro de titanio-aluminio) forma una fina capa de óxido de aluminio al calentarse, que protege el filo a alta temperatura. Es uno de los recubrimientos más usados para corte en seco y a alta velocidad.",
      "En HERCAN el TiAlN cubre fresas, brocas e insertos para acero y fundición, incluidos los endurecidos; combínalo con material y categoría para afinar la selección.",
    ],
    bullets: [
      {
        heading: "Fortalezas",
        items: ["Resistencia a alta temperatura", "Ideal para corte en seco", "Acero y fundición"],
      },
      {
        heading: "Aplicaciones",
        items: ["Alta velocidad", "Materiales endurecidos"],
      },
    ],
  },
  tin: {
    name: "TiN",
    title: "Herramientas con recubrimiento TiN",
    metaTitle: "Recubrimiento TiN (nitruro de titanio) | HERCAN",
    metaDescription:
      "Herramienta con recubrimiento TiN, el de propósito general de color dorado. Mayor dureza superficial y menor fricción, en HERCAN.",
    intro: [
      "El TiN (nitruro de titanio), de característico color dorado, es el recubrimiento de propósito general clásico: aumenta la dureza superficial y reduce la fricción, prolongando la vida de la herramienta.",
      "HERCAN lo ofrece sobre todo en herramienta HSS y de propósito general para acero y aplicaciones sin exigencias térmicas extremas.",
    ],
    bullets: [
      {
        heading: "Fortalezas",
        items: ["Propósito general", "Menor fricción", "Buen costo-beneficio"],
      },
      {
        heading: "Reconócelo por",
        items: ["Color dorado", "Uso versátil"],
      },
    ],
  },
  ticn: {
    name: "TiCN",
    title: "Herramientas con recubrimiento TiCN",
    metaTitle: "Recubrimiento TiCN (carbonitruro de titanio) | HERCAN",
    metaDescription:
      "Herramienta con recubrimiento TiCN, más duro que el TiN y resistente a la abrasión, para aceros duros y avances altos. En HERCAN.",
    intro: [
      "El TiCN (carbonitruro de titanio) es más duro que el TiN y resiste mejor la abrasión, lo que lo hace útil en aceros de mayor dureza y en operaciones con avances elevados.",
      "En HERCAN el TiCN aparece en herramienta para fresado y taladrado de materiales abrasivos donde el TiN se queda corto.",
    ],
    bullets: [
      {
        heading: "Fortalezas",
        items: ["Más duro que TiN", "Resiste abrasión", "Avances altos"],
      },
      {
        heading: "Aplicaciones",
        items: ["Aceros duros", "Fundición", "Materiales abrasivos"],
      },
    ],
  },
  alcrn: {
    name: "AlCrN",
    title: "Herramientas con recubrimiento AlCrN",
    metaTitle: "Recubrimiento AlCrN (nitruro de aluminio-cromo) | HERCAN",
    metaDescription:
      "Herramienta con recubrimiento AlCrN, muy alta resistencia térmica y a la oxidación, para corte en seco y aleaciones difíciles. En HERCAN.",
    intro: [
      "El AlCrN (nitruro de aluminio-cromo) resiste temperaturas aún más altas que el TiAlN y ofrece excelente resistencia a la oxidación, por lo que destaca en corte en seco y materiales exigentes.",
      "HERCAN lo ofrece en herramienta de alto rendimiento para producción demandante y aleaciones difíciles.",
    ],
    bullets: [
      {
        heading: "Fortalezas",
        items: ["Muy alta resistencia térmica", "Resiste oxidación", "Corte en seco"],
      },
      {
        heading: "Aplicaciones",
        items: ["Producción exigente", "Aleaciones difíciles"],
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
    // Preguntas que Google muestra para "herramientas para roscar" en México (nov 2026).
    {
      question: "¿Qué broca usar para hacer rosca de 8 mm?",
      answer:
        "Para una rosca M8 de paso normal (M8 x 1.25) la broca es de 6.8 mm. La regla en rosca métrica es el diámetro nominal menos el paso; la tabla completa está en la página de machuelos.",
    },
    {
      question: "¿Cómo se llama la herramienta que hace rosca a tubos?",
      answer:
        "Es la tarraja para tubo: corta rosca cónica (NPT o BSP) en el extremo del tubo para que la conexión selle a presión, y suele montarse en un juego o roscadora para tubería. No es la misma que la tarraja para varilla, que hace rosca recta.",
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
  // La categoría "Abrasivos" hoy son limas rotativas de carburo: FAQ de lo que vende.
  abrasivos: [
    {
      question: "¿Qué es una lima rotativa de carburo?",
      answer:
        "Es una herramienta con cabeza de carburo de tungsteno y filos tallados que gira a alta velocidad, montada en un esmeril recto o rectificador. Sirve para desbarbar, rebajar, dar forma y ajustar agujeros en metal.",
    },
    {
      question: "¿Es lo mismo lima rotativa y fresa rotativa?",
      answer:
        "Sí, son dos nombres para la misma herramienta. A veces también se les dice fresas de carburo, pero ese nombre se confunde con las fresas dentales y con las fresas para CNC (endmills), que son otra cosa.",
    },
    {
      question: "¿Qué significan los códigos SB, SD o SF?",
      answer:
        "Son el código de forma de la cabeza: SB y SC son cilíndricas, SD esférica, SE ovalada, SF y SG de árbol, SH de flama, y SL y SM cónicas. El número que sigue (SB-1, SB-3…) indica la medida; cada modelo del catálogo trae además el diámetro en pulgadas.",
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
    // Pregunta que Google muestra para "equipos de medición" en México (nov 2026).
    {
      question: "¿Cuáles son los instrumentos básicos de medición mecánica?",
      answer:
        "En el taller, tres: el vernier o calibrador pie de rey para trabajo general (0.01 a 0.02 mm), el micrómetro para tolerancias finas (0.01 mm, y 0.001 mm en modelos de precisión) y el indicador de carátula para comparar contra una referencia. Se complementan con bloques patrón, escuadras y compases.",
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
    // Lectura del código y del material a maquinar: tablas verificadas de la guía de insertos.
    {
      question: "¿Cómo se lee el código de un inserto, por ejemplo CNMG 120408?",
      answer:
        "Cada posición dice algo: C es la forma (rombo de 80°), N el ángulo de incidencia (0°), M la tolerancia (media, la más común), G el tipo (agujero y rompevirutas en ambas caras), 12 el largo del filo (unos 12.7 mm), 04 el espesor (unos 4.76 mm) y 08 el radio de punta (0.8 mm).",
    },
    {
      question: "¿Qué significan las letras P, M y K en un inserto?",
      answer:
        "Son los grupos de material a maquinar de la norma ISO 513: P es acero (azul), M acero inoxidable (amarillo), K fundición (rojo), N no ferrosos como aluminio (verde), S superaleaciones y titanio, y H materiales endurecidos. El grado del inserto indica para cuál está hecho.",
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
    // Recubrimiento por material: tabla verificada de la guía de fresas. La segunda deshace la confusión con las fresas dentales, que ganan "fresas de carburo" en Google.
    {
      question: "¿Qué recubrimiento de fresa conviene para cada material?",
      answer:
        "Para aluminio y no ferrosos, sin recubrimiento o DLC; para acero al carbono y fundición, TiAlN; para inoxidable y superaleaciones, AlCrN; y para aceros endurecidos de más de 45 HRC, AlCrN o nACo.",
    },
    {
      question: "¿Son las mismas que las fresas de carburo dentales?",
      answer:
        "No. Estas fresas (endmills) son para cortar metal en fresadora o centro de maquinado CNC. Las fresas de carburo dentales son instrumental de odontología, y las limas rotativas de carburo, que a veces también llaman fresas, se usan en esmeril recto para desbarbar.",
    },
  ],
  broca: [
    {
      question: "¿Qué broca se usa para acero inoxidable?",
      answer:
        "Para acero inoxidable se usan brocas de cobalto (M35/M42) o de carburo con recubrimiento TiAlN. Trabaja a RPM baja, con mucho refrigerante y sin dejar de avanzar: si te detienes, el inoxidable se endurece por trabajo y la broca deja de entrar.",
    },
    {
      question: "¿De qué material son las brocas para metal?",
      answer:
        "Principalmente HSS (acero rápido), HSS con cobalto —para material duro e inoxidable— y carburo de tungsteno para producción y aceros endurecidos. Para diámetros grandes también hay brocas de inserto intercambiable.",
    },
    {
      question: "¿A cuántas RPM se perfora el metal?",
      answer:
        "Depende del material y del diámetro: mientras más duro el metal o más grande la broca, menos RPM. El acero inoxidable pide RPM bajas (del orden de 400-800 en diámetros chicos) con mucho refrigerante; el aluminio admite RPM altas.",
    },
    {
      question: "¿Qué broca uso para aluminio?",
      answer:
        "Una broca de HSS bien afilada, de ángulo de punta agudo, trabajando a alta RPM y evacuando la viruta con frecuencia. El aluminio es blando y pegajoso, así que la prioridad es despejar la viruta para que no se embarre.",
    },
    {
      question: "¿Venden brocas por pieza y para volumen de producción?",
      answer:
        "Sí. HERCAN es distribuidor B2B y B2C: manejamos desde piezas sueltas hasta pedidos de producción para CNC, de marcas como Iscar, Toolmex y YG-1. Solicita tu cotización en línea y te respondemos en horas.",
    },
    // Preguntas que Google muestra para "brocas para metal" en México (nov 2026).
    {
      question: "¿Cómo saber si una broca sirve para metal?",
      answer:
        "La broca para metal es helicoidal, de acero rápido (HSS), cobalto o carburo, con punta cónica de 118° o 135° y sin la punta de centrado de las brocas para madera ni la pastilla en forma de flecha de las de concreto. Casi siempre lleva grabado HSS, HSS-Co o el material en el zanco.",
    },
    {
      question: "¿Cuántas medidas de brocas para metal hay?",
      answer:
        "Se fabrican en milímetros (de décima en décima) y en pulgadas fraccionales, además de las series de número y letra. Las fraccionales más usadas van de 1/16\" (1.59 mm) a 1/2\" (12.70 mm); en esta página está la tabla de equivalencias con los modelos que hay en el catálogo.",
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
    // Preguntas que Google muestra para "machuelos" en México (nov 2026).
    {
      question: "¿Cuáles son los tipos principales de machuelos?",
      answer:
        "Por su geometría hay tres: el machuelo de mano (se usa en juego de tres: cónico, intermedio y de fondo, para roscar a mano con maneral), el helicoidal o de espiral (saca la viruta hacia atrás, ideal para agujero ciego) y el de punta espiral o gun (empuja la viruta hacia adelante, para agujero pasante y en máquina).",
    },
    {
      question: "¿Cómo saber qué broca usar para un machuelo?",
      answer:
        "En rosca métrica, la broca es el diámetro nominal menos el paso: un M8 x 1.25 lleva broca de 6.8 mm y un M6 x 1.0 lleva 5.0 mm. En rosca en pulgada se usa la tabla UNC/UNF; por ejemplo, 1/4\"-20 lleva broca #7 (5.1 mm). Arriba en esta página está la tabla con las medidas más pedidas.",
    },
    {
      question: "¿Qué significa NC y NF en los machuelos?",
      answer:
        "Son roscas del sistema unificado en pulgadas: NC (o UNC) es la rosca corriente o gruesa y NF (o UNF) es la rosca fina, con más hilos por pulgada. Por ejemplo, 1/4\"-20 es NC y 1/4\"-28 es NF; cada una lleva una broca distinta para el barreno.",
    },
  ],
  buril: [
    {
      question: "¿Qué es un buril de torno?",
      answer:
        "Un buril es la herramienta de corte de un solo filo que se monta en la torreta del torno para cilindrar, refrentar, ranurar o roscar. Se afila según la operación y el material de la pieza.",
    },
    {
      question: "¿Qué diferencia hay entre un buril de HSS y uno con inserto?",
      answer:
        "El buril integral de HSS se afila a mano y es económico y versátil para taller. El buril con inserto de metal duro cambia solo la plaquita cuando se desgasta, aguanta más velocidad y es la opción para producción.",
    },
    {
      question: "¿Venden buriles por pieza?",
      answer:
        "Sí. HERCAN es distribuidor B2B y B2C: manejamos buriles cuadrados y de forma por pieza y para volumen. Solicita tu cotización en línea y te respondemos en horas.",
    },
    // Preguntas que Google muestra para "buril" en México (nov 2026); respuestas de la guía de buriles.
    {
      question: "¿De qué material son los buriles para torno?",
      answer:
        "De acero rápido (HSS), tenaz, económico y fácil de reafilar; de HSS con cobalto, que aguanta más temperatura; y de carburo, soldado en la punta (buril calzado) o como inserto intercambiable, para cortar más rápido en producción.",
    },
    {
      question: "¿Qué otro nombre tiene el buril?",
      answer:
        "También se le conoce como cuchilla de torno. Es la herramienta de corte de un solo filo que se monta en el torno para arrancar viruta de la pieza mientras gira.",
    },
    {
      question: "¿Cuáles son los tipos de buril?",
      answer:
        "Según la operación: recto de desbaste, recto de acabado, refrentador, tronzador o ranurador, roscador, de mandrinar y redondo o de forma. En esta página está la tabla con el ángulo orientativo de cada uno.",
    },
  ],
  avellanador: [
    {
      question: "¿Para qué sirve un avellanador?",
      answer:
        "Un avellanador abre un chaflán cónico en la boca de un agujero, ya sea para alojar la cabeza de un tornillo avellanado a ras de la superficie o para desbarbar el borde del agujero.",
    },
    {
      question: "¿Cuándo uso un avellanador de 82° y cuándo de 90°?",
      answer:
        "El ángulo debe coincidir con la cabeza del tornillo: 82° para tornillos en pulgada y 90° para tornillos métricos. Usar el ángulo correcto asegura que la cabeza quede a ras.",
    },
    {
      question: "¿Se puede usar para desbarbar?",
      answer:
        "Sí. Además de avellanar para tornillos, el avellanador elimina la rebaba que deja la broca en la boca del agujero, dejando un borde limpio; se trabaja a baja velocidad.",
    },
    // Google no muestra preguntas para "avellanador" en México (nov 2026); estas salen
    // de lo que la guía explica y las fichas no: filos y velocidad.
    {
      question: "¿Cuántos filos debe tener un avellanador?",
      answer:
        "Depende del acabado que buscas. El de un filo corta más rápido pero vibra más y deja más rebaba si no controlas el avance; el de tres filos es el más vendido por su balance entre acabado y velocidad, y el de varios filos (6) da el mejor acabado y menos vibración en producción en serie.",
    },
    {
      question: "¿A qué velocidad se trabaja un avellanador?",
      answer:
        "Más lento que al perforar: entre un tercio y la mitad de las RPM que usarías con una broca del mismo diámetro en ese material, con avance suave y constante. Si la RPM es demasiado alta, el chaflán sale con marcas en forma de polígono (traqueteo) y el filo se gasta antes.",
    },
  ],
  tarraja: [
    {
      question: "¿Qué es una tarraja o dado de roscar?",
      answer:
        "Una tarraja (dado de roscar) es la herramienta que genera roscas externas sobre una barra o tornillo por arranque de viruta. Se gira con un desterrajador (portaterrajas) alrededor de la pieza.",
    },
    {
      question: "¿Cuál es la diferencia entre una tarraja y un machuelo?",
      answer:
        "La tarraja hace la rosca EXTERNA (sobre una barra); el machuelo hace la rosca INTERNA (dentro de un agujero). Son herramientas complementarias del roscado manual.",
    },
    {
      question: "¿Vienen métricas y en pulgada?",
      answer:
        "Sí. Manejamos tarrajas métricas y en pulgada (UNC/UNF) en acero rápido (HSS), por pieza y en juego con machuelos y maneral. Solicita tu cotización en línea.",
    },
    // Preguntas que Google muestra para "tarraja" en México (nov 2026).
    {
      question: "¿Cuáles son los tipos de tarraja?",
      answer:
        "Hay cuatro: la sólida (un cuerpo redondo sin ajuste, la más rígida y económica), la partida o ajustable (se abre o cierra un poco para compensar el desgaste), la hexagonal (se gira con dado, matraca o llave, práctica para retocar una rosca dañada) y la tarraja para tubo, que corta rosca cónica NPT o BSP.",
    },
    {
      question: "¿Cómo se llama la pieza para hacer roscas?",
      answer:
        "Depende de dónde va la rosca. Para rosca por fuera, sobre una varilla o tornillo, es la tarraja o dado de roscar. Para rosca por dentro de un barreno es el machuelo. Se venden por pieza y en juegos de machuelos y tarrajas.",
    },
    {
      question: "¿Es lo mismo una tarraja para tubo?",
      answer:
        "No. La tarraja para tubo corta rosca cónica (NPT o BSP) en el extremo de un tubo para que la conexión selle a presión, y suele montarse en un juego o roscadora para tubería. Las de esta página son para varilla y tornillo, con rosca recta. Si necesitas roscar tubo, pídela en cotización.",
    },
    {
      question: "¿De qué diámetro debe ser la varilla para roscar?",
      answer:
        "Igual o ligeramente menor al diámetro nominal de la rosca, nunca mayor. En métrica, la regla es el diámetro nominal menos 0.1 veces el paso (para M8 x 1.25, de 7.85 a 7.92 mm); en pulgada se usa barra al diámetro nominal. Hazle un chaflán de unos 45° en la punta para que la tarraja arranque derecha.",
    },
    {
      question: "¿Cuánto cuesta una tarraja?",
      answer:
        "Depende de la medida, el sistema de rosca y si la compras suelta o en juego con machuelos y desterrajador. En esta página ves el precio y la existencia de cada modelo; si tu medida no aparece, cotízala.",
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
    // Preguntas que Google muestra para "escariador" en México (nov 2026).
    {
      question: "¿Qué tipos de escariadores existen?",
      answer:
        "Los hay de mano, que se giran con maneral, y para máquina, que se montan en taladro, fresadora o centro de maquinado; de canal recto o helicoidal; fijos o ajustables; y cónicos, para agujeros de pasador cónico. Por material, de acero rápido (HSS), cobalto o carburo.",
    },
    {
      question: "¿Cómo se usa un escariador?",
      answer:
        "Primero se taladra el agujero un poco por debajo de la medida final. Luego se pasa el escariador a menor velocidad que la broca, con avance constante y lubricante, y al terminar se saca sin girarlo en reversa para no dañar los filos ni el acabado.",
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

// ── INSTRUMENTOS DE MEDICIÓN ──────────────────────────────────────────────────
// Silo PARALELO a TIPO_CONTENT pero para la familia MEDICIÓN (hub /instrumentos →
// /instrumento/[slug]). `name` = valor EXACTO de `tipo_instrumento` (scope). Camino B:
// se muestran los SKUs reales en existencia (Insize/Mitutoyo) y lo que no hay se
// canaliza a cotización ("sobre pedido"). Reutiliza la forma de TipoContent.
export const INSTRUMENTO_CONTENT: Record<string, TipoContent> = {
  micrometro: {
    name: "Micrómetro",
    // Singular y con "digital" al frente: "micrometro" (27,100/mes) y "micrometro
    // digital" (2,400/mes) son como se busca en México.
    title: "Micrómetros digitales y analógicos",
    metaTitle: "Micrómetro digital y analógico: exteriores e interiores | HERCAN",
    metaDescription:
      "Micrómetros en HERCAN: digitales y analógicos, de exteriores, interiores y profundidad, en rangos de 0-25, 25-50 mm y más (Insize y otras marcas). Cotización B2B y B2C en México.",
    intro: [
      "Un micrómetro es el instrumento de medición de precisión que mide dimensiones pequeñas —espesores y diámetros exteriores, interiores o de profundidad— con resolución típica de 0.01 o 0.001 mm, mediante un tornillo micrométrico calibrado.",
      "Los hay de lectura digital o analógica (de tambor), en rangos por tramos (0-25, 25-50 mm…). En HERCAN encuentras micrómetros de marcas de metrología; filtra por marca y disponibilidad, y cotiza el modelo que necesites.",
    ],
    bullets: [
      {
        heading: "Por tipo",
        items: ["De exteriores", "De interiores", "De profundidad", "Digital / analógico"],
      },
    ],
    // Tipos y qué mide cada uno: tabla verificada de la guía del micrómetro.
    medidas: {
      titulo: "Tipos de micrómetro y qué mide cada uno",
      intro:
        "Todos miden con un tornillo calibrado: al girar el tambor, el husillo avanza una distancia exacta. Cambia qué parte de la pieza mide cada uno y cómo se lee.",
      columnas: ["Tipo", "Qué mide"],
      filas: [
        { celdas: ["De exteriores", "Diámetros y espesores externos. Es el más común y viene por tramos de 25 mm (0-25, 25-50, 50-75 mm…)."] },
        { celdas: ["De interiores", "Diámetros internos de agujeros."] },
        { celdas: ["De profundidad", "Profundidad de agujeros y ranuras."] },
        { celdas: ["Digital o analógico", "El digital da lectura directa y salida de datos; el analógico no usa batería y es robusto."] },
      ],
      pie: {
        href: "/blog/como-usar-un-micrometro",
        texto: "Cómo leer un micrómetro paso a paso y cuáles son sus partes",
      },
    },
  },
  "calibrador-vernier": {
    name: "Calibrador vernier",
    // "vernier" (40,500/mes en MX) va primero: es como lo busca el taller.
    title: "Vernier y calibradores (pie de rey)",
    metaTitle: "Vernier (calibrador pie de rey): digital y análogo | HERCAN",
    metaDescription:
      "Calibradores vernier o pie de rey en HERCAN: digitales y análogos, 0-150, 0-200 y 0-300 mm (Insize). Miden exterior, interior, profundidad y escalón. Cotización B2B y B2C.",
    intro: [
      "Un calibrador vernier (o pie de rey) es el instrumento más versátil del taller: mide dimensiones exteriores, interiores, de profundidad y de escalón con una sola herramienta, con resolución de 0.01 o 0.02 mm.",
      "Los hay de lectura digital, de carátula o vernier tradicional, en rangos de 0-150, 0-200 y 0-300 mm. En HERCAN encuentras calibradores de metrología; filtra por marca y disponibilidad y cotiza el modelo que necesites.",
    ],
    bullets: [
      {
        heading: "Por lectura",
        items: ["Digital", "De carátula", "Vernier tradicional"],
      },
      {
        heading: "Rangos comunes",
        items: ['0-150 mm (6")', '0-200 mm (8")', '0-300 mm (12")'],
      },
    ],
    // Ventajas y cuidados de la tabla verificada de la guía; resoluciones típicas del
    // mercado (análogo 0.02/0.05 mm, carátula 0.02 mm, digital 0.01 mm).
    medidas: {
      titulo: "Tipos de vernier: cuál elegir",
      intro:
        "Los tres tipos miden lo mismo (exterior, interior, profundidad y escalón); cambian la forma de leer, la resolución y el cuidado que piden.",
      columnas: ["Tipo", "Resolución típica", "Ventaja", "A tener en cuenta"],
      filas: [
        { celdas: ["Vernier análogo", "0.02 o 0.05 mm", "Económico, sin batería, robusto", "Requiere práctica para leer el nonio"] },
        { celdas: ["De carátula", "0.02 mm", "Lectura rápida en el reloj, sin batería", "El engrane puede dañarse con golpes o viruta"] },
        { celdas: ["Digital", "0.01 mm", "Lectura instantánea, cambia mm/pulg, salida de datos", "Depende de batería"] },
      ],
      pie: {
        href: "/blog/como-leer-calibrador-vernier",
        texto: "Cómo leer un vernier paso a paso y cuáles son sus partes",
      },
    },
  },
  indicador: {
    name: "Indicador carátula",
    // "indicador de caratula" 2,400/mes y "reloj comparador" 1,300: los dos nombres en H1.
    title: "Indicadores de carátula y relojes comparadores",
    metaTitle: "Indicador de carátula y reloj comparador (Mitutoyo) | HERCAN",
    metaDescription:
      "Indicadores de carátula y comparadores en HERCAN: de cuadrante y de pestaña (palpador), marca Mitutoyo. Para verificar concentricidad, planitud y reglaje. Cotización B2B y B2C.",
    intro: [
      "Un indicador de carátula (comparador o reloj indicador) mide diferencias de posición muy pequeñas contra una referencia: verifica concentricidad, planitud y paralelismo, y sirve para reglar máquinas y montajes. La aguja amplifica el desplazamiento del palpador.",
      "Los hay de cuadrante (vástago vertical) y de pestaña o palpador lateral, con resoluciones de 0.01 hasta 0.001 mm. En HERCAN manejamos indicadores Mitutoyo; filtra por marca y disponibilidad y cotiza el modelo que necesites.",
    ],
    bullets: [
      {
        heading: "Por tipo",
        items: ["De cuadrante", "De pestaña / palpador", "Comparador digital"],
      },
    ],
    // Aplicaciones y resolución: tabla verificada de la guía del indicador.
    medidas: {
      titulo: "Qué medir con un indicador y con qué resolución",
      intro:
        "El indicador no da una medida absoluta: compara contra una referencia. Estas son las aplicaciones de taller más comunes, la resolución que piden y el tipo de indicador que conviene.",
      columnas: ["Aplicación", "Resolución recomendada", "Tipo recomendado"],
      filas: [
        { celdas: ["Concentricidad de un eje o husillo", "0.01 mm (0.001 mm en precisión)", "Carátula con palpador vertical y base magnética"] },
        { celdas: ["Excentricidad de engranes, levas o cigüeñal", "0.01 mm", "Carátula montado entre centros"] },
        { celdas: ["Planitud de una superficie", "0.001 a 0.01 mm", "Digital o carátula de alta resolución"] },
        { celdas: ["Paralelismo entre caras o ejes", "0.01 mm", "Carátula estándar, palpador vertical"] },
        { celdas: ["Alineación de la prensa en la fresadora", "0.01 mm", "Base magnética y palpador vertical"] },
        { celdas: ["Centrado de la pieza en el torno", "0.01 mm", "Carátula o de palanca"] },
        { celdas: ["Espacios reducidos o superficies laterales", "0.01 mm (0.001 mm en modelos finos)", "De palanca (pestaña)"] },
      ],
      pie: {
        href: "/blog/como-usar-indicador-de-caratula",
        texto: "Cómo montar y leer un indicador de carátula paso a paso",
      },
    },
  },
};

export const INSTRUMENTO_FAQS: Record<string, Faq[]> = {
  micrometro: [
    {
      question: "¿Qué mide un micrómetro y con qué precisión?",
      answer:
        "Mide dimensiones pequeñas —espesores y diámetros exteriores, interiores o de profundidad— con resolución típica de 0.01 mm (y hasta 0.001 mm en modelos de precisión), mucho más fino que un calibrador vernier.",
    },
    {
      question: "¿Qué diferencia hay entre un micrómetro y un calibrador vernier?",
      answer:
        "El micrómetro es más preciso (0.001-0.01 mm) pero mide un rango corto por tramos (0-25, 25-50 mm…); el calibrador vernier es más versátil (exterior, interior, profundidad) y de mayor rango, pero con menor resolución (0.01-0.02 mm).",
    },
    {
      question: "¿Manejan micrómetros en existencia y bajo pedido?",
      answer:
        "Sí. HERCAN es distribuidor B2B y B2C de metrología. Mostramos los modelos en existencia y, si necesitas un rango o marca que no esté en stock, lo conseguimos: solicita tu cotización en línea.",
    },
    // Preguntas que Google muestra para "micrometro" en México (nov 2026). Parte de esa
    // búsqueda es por la UNIDAD (micra, µm); la primera respuesta deshace la confusión.
    {
      question: "¿Un micrómetro mide en micras?",
      answer:
        "El nombre se presta a confusión. El micrómetro como unidad (µm), también llamado micra, equivale a 0.001 mm. El micrómetro como instrumento mide en milímetros o pulgadas: lo habitual es una resolución de 0.01 mm (10 micras) y los modelos de precisión llegan a 0.001 mm (1 micra).",
    },
    {
      question: "¿Qué rango de micrómetro necesito?",
      answer:
        "El que cubra la medida de tu pieza. Los micrómetros de exteriores vienen por tramos de 25 mm (0-25, 25-50, 50-75 mm…) porque el husillo recorre 25 mm; para una pieza de 30 mm, por ejemplo, necesitas el de 25-50 mm.",
    },
    {
      question: "¿Cuáles son las ventajas de usar un micrómetro?",
      answer:
        "Mide más fino que un calibrador vernier (0.01 mm, y 0.001 mm en modelos de precisión) y su trinquete aplica siempre la misma presión de medición, así que la lectura se repite igual entre una medición y otra. Es el instrumento para tolerancias finas.",
    },
  ],
  "calibrador-vernier": [
    {
      question: "¿Qué es un calibrador vernier o pie de rey?",
      answer:
        "Es el instrumento de medición más usado en el taller: con una sola herramienta mides dimensiones exteriores, interiores, de profundidad y de escalón, con resolución de 0.01 a 0.02 mm.",
    },
    {
      question: "¿Cuál es mejor, digital o de carátula?",
      answer:
        "El digital es el más rápido de leer y evita el error de paralaje; el de carátula no depende de batería y es robusto para taller; el vernier tradicional es el más económico. Elige según uso y preferencia.",
    },
    {
      question: "¿Tienen calibradores en existencia y bajo pedido?",
      answer:
        "Sí. Mostramos los modelos disponibles (0-150, 0-200, 0-300 mm) y, si necesitas otro rango o marca, lo cotizamos y conseguimos. Solicita tu cotización en línea.",
    },
    // Preguntas que Google muestra para "calibrador vernier" en México (nov 2026).
    {
      question: "¿Cómo se lee un vernier?",
      answer:
        "Primero lee en la escala principal los milímetros completos que quedan a la izquierda del cero del nonio. Luego busca la línea del nonio que coincide exactamente con una línea de la escala principal y súmala como fracción (por ejemplo, la línea 7 en un vernier de 0.05 mm suma 0.35 mm). La guía de lectura paso a paso está enlazada abajo.",
    },
    {
      question: "¿Cuáles son los tipos de calibradores vernier?",
      answer:
        "Por la forma de leer hay tres: vernier análogo (nonio), de carátula (reloj) y digital. Además hay versiones especiales para una sola medición, como el calibrador de profundidad, el de altura y el de interiores.",
    },
  ],
  indicador: [
    {
      question: "¿Para qué sirve un indicador de carátula?",
      answer:
        "Sirve para verificar diferencias de posición muy pequeñas contra una referencia: concentricidad, planitud, paralelismo y reglaje de máquinas y montajes. La aguja amplifica el desplazamiento del palpador.",
    },
    {
      question: "¿Qué diferencia hay entre un comparador de cuadrante y uno de pestaña?",
      answer:
        "El de cuadrante tiene el palpador en línea con el vástago (medición vertical) y más recorrido; el de pestaña o palpador lateral es compacto y llega a lugares estrechos, ideal para reglar en máquina.",
    },
    {
      question: "¿Manejan indicadores Mitutoyo?",
      answer:
        "Sí, manejamos indicadores y comparadores Mitutoyo. Mostramos los modelos en existencia y cotizamos bajo pedido los que no estén en stock. Solicita tu cotización en línea.",
    },
    // Preguntas que Google muestra para "indicador de caratula" en México (nov 2026); pasos de la guía del indicador.
    {
      question: "¿Es lo mismo indicador de carátula, comparador y reloj comparador?",
      answer:
        "Sí. En los talleres mexicanos los tres nombres se usan para el mismo instrumento: compara contra una referencia y convierte el movimiento del palpador en el giro de una aguja sobre la carátula.",
    },
    {
      question: "¿Cómo se mide con un indicador de carátula?",
      answer:
        "Se fija el indicador en su base magnética o soporte, se precarga el palpador contra la pieza (de 0.3 a 0.5 mm de recorrido, nunca a tope) y se gira el bisel para poner la aguja en cero. Después se gira o desplaza la pieza: la variación de la aguja es la medida.",
    },
  ],
};
