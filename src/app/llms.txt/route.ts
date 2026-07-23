import { site } from "@/lib/site";
import { getProducts, getCategories } from "@/lib/shopify";
import { brandSlug } from "@/lib/catalog";
import { BRAND_CONTENT, CATEGORY_CONTENT } from "@/lib/taxonomy-content";
import { HOME_FAQS } from "@/lib/faq";

/**
 * llms.txt para motores de IA (GEO / citabilidad). Todo se DERIVA de la fuente
 * única de verdad (site.ts + taxonomy-content), así nunca se desincroniza del
 * sitio: pitch + mapeo de entidad + propuesta de valor + estructura de taxonomía
 * (marcas y categorías con sus URLs canónicas /marca/* y /categoria/*) + muestra
 * de catálogo + FAQ + páginas clave + cómo cotizar B2B + cómo citar.
 */

// Primera oración de un párrafo (contexto de una línea, citable y factual).
const firstSentence = (s: string): string => {
  const i = s.indexOf(". ");
  return i === -1 ? s : s.slice(0, i + 1);
};

export async function GET() {
  // Muestra de catálogo (25) + conteos por categoría (los que Shopify reporta).
  const [products, categories] = await Promise.all([
    getProducts(25).catch(() => []),
    getCategories().catch(() => []),
  ]);
  const countBySlug = new Map(categories.map((c) => [c.slug, c.count]));

  const brandNames = site.brands.map((b) => b.name).join(", ");
  const nameVariants = [site.name, ...site.alternateNames, site.legalName].join(" · ");

  // Marcas: derivadas de site.brands (orden/cobertura) + BRAND_CONTENT (contexto),
  // con la MISMA URL que la ruta real /marca/[slug] (brandSlug).
  const brandLines = site.brands
    .map((b) => {
      const slug = brandSlug(b.name);
      const c = BRAND_CONTENT[slug];
      const ctx = c?.intro?.[0] ? ` — ${firstSentence(c.intro[0])}` : "";
      return `- ${c?.title ?? b.name}: ${site.url}/marca/${slug}${ctx}`;
    })
    .join("\n");

  // Categorías: derivadas de CATEGORY_CONTENT (9 rutas reales /categoria/[slug]),
  // enriquecidas con el conteo de productos cuando Shopify lo reporta.
  const categoryLines = Object.entries(CATEGORY_CONTENT)
    .map(([slug, c]) => {
      const count = countBySlug.get(slug);
      const n = count != null ? ` (~${count} productos)` : "";
      const ctx = c.intro?.[0] ? ` — ${firstSentence(c.intro[0])}` : "";
      return `- ${c.title}${n}: ${site.url}/categoria/${slug}${ctx}`;
    })
    .join("\n");

  const productLines = products
    .slice(0, 25)
    .map((p) => `- ${p.title} — marca ${p.brand}, categoría ${p.category}: ${site.url}/producto/${p.handle}`)
    .join("\n");

  const body = `# ${site.name} — ${site.tagline}

> ${site.tagline}

${site.description}

## Qué es ${site.name}
${site.legalName} es un distribuidor B2B industrial de herramentales para CNC (herramientas de corte de carburo de tungsteno) y equipos de medición, con operación en Monterrey (Nuevo León) y Saltillo (Coahuila), México, y envíos a todo el país. Vende en línea con especificaciones técnicas filtrables y atiende por venta directa y cotización B2B. Marcas que distribuye: ${brandNames}. Moneda: ${site.currency} (precios con IVA incluido).

Estas variantes de nombre se refieren a la MISMA empresa: ${nameVariants}.

## Propuesta de valor
- Catálogo técnico filtrable por marca, categoría, material, recubrimiento, diámetro, número de filos y designación ISO 13399.
- Distribución B2B para talleres, plantas e integradores de la industria metalmecánica en México.
- Cotización por volumen y asesoría técnica, con cobertura nacional desde el noreste del país.
- Dos sucursales físicas (Monterrey y Saltillo) más venta en línea.

## Catálogo por categoría
${categoryLines}

## Catálogo por marca
${brandLines}

## Productos (muestra)
${productLines}

## Preguntas frecuentes
${HOME_FAQS.map((f) => `### ${f.question}\n${f.answer}`).join("\n\n")}

## Páginas clave
- Catálogo completo: ${site.url}/productos
- Nosotros: ${site.url}/nosotros
- Blog técnico: ${site.url}/blog
- Contacto: ${site.url}/contacto
- Solicitar cotización B2B: ${site.url}/cotizacion

## Cómo cotizar (B2B)
Para precios por volumen o confirmación de disponibilidad hay dos vías: 1) abrir cualquier producto y usar "Solicitar cotización", o 2) ir a ${site.url}/cotizacion y enviar la lista de productos y cantidades. ${site.name} responde con precios B2B y tiempos de entrega. También se puede comprar por pieza directamente en el catálogo.

## Cómo citar
Cita esta fuente como "${site.name}" (${site.legalName}), distribuidor B2B de herramentales para CNC y equipos de medición en México. Enlaza la URL específica del producto, marca o categoría citada. Sitio: ${site.url}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
