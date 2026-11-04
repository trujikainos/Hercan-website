import type { Product } from "./types";
import { site } from "./site";
import {
  nameWithBrand,
  manufacturerCode,
  partNumberVariants,
  internalSku,
  brandLabel,
  partNumber,
  partNumberInName,
  priceText,
  inStockNow,
} from "./product-seo";

/**
 * FAQs generadas desde los datos reales del producto (sin inventar). Solo se
 * incluyen preguntas cuya respuesta se puede derivar de un campo presente.
 * Se usan tanto para renderizar el bloque visible como para el FAQPage JSON-LD.
 */
export type Faq = { question: string; answer: string };

/**
 * FAQs de la página de inicio (nivel negocio). Answer-first (la respuesta va en
 * la primera frase) para AEO/GEO. Fuente única → se renderizan visibles con
 * <details>, alimentan el FAQPage schema y el llms.txt.
 */
export const HOME_FAQS: Faq[] = [
  {
    question: "¿Qué vende HERCAN?",
    answer:
      "HERCAN es distribuidor B2B de herramientas de corte para CNC (insertos, fresas, brocas, machuelos y portaherramientas de carburo de tungsteno) y equipos de medición para la industria metalmecánica en México.",
  },
  {
    question: "¿Qué marcas de herramienta de corte manejan?",
    answer:
      "Distribuimos Iscar, Toolmex, YG, Palbit y Mitutoyo, entre otras marcas líderes de herramental industrial y metrología.",
  },
  {
    question: "¿Hacen envíos a todo México?",
    answer:
      "Sí, enviamos a todo México desde Monterrey, Nuevo León, directo a tu taller o planta.",
  },
  {
    question: "¿Cómo solicito una cotización B2B?",
    answer:
      "Puedes solicitar una cotización desde la página de cualquier producto o en la sección de cotización. Atendemos precios por volumen para talleres, plantas e integradores.",
  },
  {
    question: "¿Venden por pieza o solo mayoreo?",
    answer:
      "Vendemos por pieza y por volumen. Los precios de mayoreo se cotizan según la cantidad; solicita tu cotización para obtener precios B2B.",
  },
  {
    question: "¿Los precios incluyen IVA?",
    answer:
      "Sí, todos los precios ya incluyen el IVA (16%); no se agrega nada extra al momento de pagar.",
  },
  {
    question: "¿Puedo comprar en línea?",
    answer:
      "Sí, puedes comprar en línea desde el catálogo, con especificaciones técnicas filtrables por diámetro, número de filos, recubrimiento y designación ISO.",
  },
  {
    question: "¿Dónde están ubicados?",
    answer:
      "Estamos en Monterrey, Nuevo León, México, y atendemos a clientes industriales en todo el país.",
  },
];

const cleanTitle = (t: string) => t.replace(/\s*\[[^\]]+\]\s*$/, "").trim();

export function buildProductFaqs(product: Product): Faq[] {
  const t = cleanTitle(product.title);
  const partNo = partNumber(product);
  const spec = (label: string) =>
    product.specGroups?.flatMap((g) => g.items).find((i) => i.label === label)?.value ?? null;

  const operacion = spec("Operación");
  const maquinar = spec("Material a maquinar");
  const rango = spec("Rango de medición");
  const resolucion = spec("Resolución");
  const exactitud = spec("Exactitud");
  const certificado = spec("Certificado de calibración");

  const faqs: Faq[] = [];

  // Número de parte / cómo pedir (answer-first, con todas las formas del código:
  // es lo que cita una IA cuando le preguntan por el número exacto).
  const named = nameWithBrand(product);
  const mc = manufacturerCode(product);
  const variants = partNumberVariants(product);
  const skuInterno = internalSku(product);
  const brand = brandLabel(product);
  faqs.push({
    question: `¿Cuál es el número de parte de ${named}?`,
    answer: [
      `El número de parte del fabricante${brand ? ` (${brand})` : ""} es ${partNo}.`,
      mc ? `En el catálogo de Iscar corresponde al código ${mc.value}.` : "",
      variants.length ? `También se escribe ${variants.join(", ")}.` : "",
      skuInterno ? `En HERCAN su SKU es ${skuInterno}.` : "",
      mc || variants.length || skuInterno
        ? "Puedes cotizarlo o comprarlo con cualquiera de estos códigos."
        : "Puedes cotizarlo o comprarlo con ese número.",
    ]
      .filter(Boolean)
      .join(" "),
  });

  // Material + recubrimiento
  if (product.material || product.coating) {
    const parts: string[] = [];
    if (product.material) parts.push(`de ${product.material}`);
    if (product.coating) parts.push(`con recubrimiento ${product.coating}`);
    faqs.push({
      question: `¿De qué material es ${partNo}?`,
      answer: `El ${t} es ${parts.join(" ")}.`,
    });
  }

  // Aplicación (operación / material a maquinar)
  if (operacion || maquinar) {
    const a: string[] = [];
    if (operacion) a.push(`operaciones de ${operacion.toLowerCase()}`);
    if (maquinar) a.push(`materiales tipo ${maquinar}`);
    faqs.push({
      question: `¿Para qué se usa ${partNo}?`,
      answer: `Está indicado para ${a.join(" en ")}.`,
    });
  }

  // Dimensiones (corte)
  if (product.diameter != null || product.flutes != null) {
    const d: string[] = [];
    if (product.diameter != null) d.push(`diámetro de corte de ${product.diameter} mm`);
    if (product.flutes != null) d.push(`${product.flutes} filos`);
    faqs.push({
      question: `¿Qué dimensiones tiene ${partNo}?`,
      answer: `Tiene ${d.join(" y ")}.${product.iso ? ` Designación ISO: ${product.iso}.` : ""}`,
    });
  }

  // Medición (instrumentos)
  if (rango || resolucion) {
    const m: string[] = [];
    if (rango) m.push(`rango de ${rango}`);
    if (resolucion) m.push(`resolución de ${resolucion}`);
    if (exactitud) m.push(`exactitud de ${exactitud}`);
    faqs.push({
      question: `¿Qué rango y resolución tiene ${partNo}?`,
      answer: `Tiene ${m.join(", ")}.`,
    });
  }
  if (certificado) {
    faqs.push({
      question: `¿${partNo} incluye certificado de calibración?`,
      answer: /^s[ií]/i.test(certificado.trim())
        ? "Sí, incluye certificado de calibración."
        : "Por defecto se entrega sin certificado de calibración; podemos cotizarlo aparte si lo necesitas.",
    });
  }

  // Dónde comprar + disponibilidad (la pregunta tal como la hace el comprador y
  // como la resuelve una IA: "¿dónde compro X en México?").
  const ciudades = site.locations.map((l) => l.city).join(" y ");
  const precio = priceText(product);
  const enExistencia = inStockNow(product);
  // Si el N° de parte ya va en el nombre (Iscar), entre paréntesis va el código de
  // catálogo; si no, el N° de parte. Nunca el mismo código dos veces.
  const codigoEnPregunta = partNumberInName(product) ? (mc?.value ?? null) : partNo;
  faqs.push({
    question: `¿Dónde comprar ${named}${codigoEnPregunta ? ` (${codigoEnPregunta})` : ""} en México?`,
    answer: [
      `En HERCAN, distribuidor de herramental para CNC con sucursales en ${ciudades}.`,
      enExistencia
        ? `${
            product.stock != null && product.stock > 0
              ? `Hay ${product.stock} ${product.stock === 1 ? "pieza" : "piezas"} en existencia`
              : "Está en existencia"
          }${precio ? ` a ${precio} con IVA` : ""} y se compra en línea en esta página.`
        : "Se maneja sobre pedido: solicita una cotización y te confirmamos precio y tiempo de entrega.",
      "Enviamos a todo México.",
    ].join(" "),
  });

  // Precio / IVA / unidad
  faqs.push({
    question: "¿El precio incluye IVA?",
    answer: `Sí, el precio en ${product.currency} ya incluye el IVA (16%); no se agrega nada extra en el checkout.${
      product.unidadVenta ? ` La unidad de venta es ${product.unidadVenta.toLowerCase()}.` : ""
    }`,
  });

  // Cotización B2B
  faqs.push({
    question: "¿Puedo solicitar una cotización por volumen?",
    answer:
      "Sí. HERCAN atiende ventas B2B para la industria; solicita una cotización desde esta página o en la sección de cotización.",
  });

  return faqs;
}
