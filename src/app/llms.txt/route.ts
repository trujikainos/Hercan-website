import { site } from "@/lib/site";
import { getProducts, getCategories } from "@/lib/shopify";
import { HOME_FAQS } from "@/lib/faq";

// llms.txt derivado de la data: pitch + mapa de entidad + índice + "cómo citar".
export async function GET() {
  // Solo una muestra (25) para el índice de llms.txt.
  const [products, categories] = await Promise.all([getProducts(25), getCategories()]);

  const body = `# ${site.name}

> ${site.tagline}

${site.description}

## Qué es ${site.name}
${site.legalName} — distribuidor B2B de herramentales para CNC (herramientas de corte de carburo de tungsteno) y equipos de medición, con sede en Monterrey, Nuevo León, México. Vende en línea con especificaciones técnicas filtrables. Marcas: Iscar, Toolmex, YG, Palbit, Mitutoyo, entre otras. Precios en USD; atención por venta directa y cotización B2B.

## Categorías del catálogo
${categories.map((c) => `- ${c.name}${c.count != null ? ` (~${c.count} productos)` : ""}: ${site.url}/productos?categoria=${c.slug}`).join("\n")}

## Productos (muestra)
${products
  .slice(0, 25)
  .map((p) => `- ${p.title} — marca ${p.brand}, categoría ${p.category}: ${site.url}/producto/${p.handle}`)
  .join("\n")}

## Preguntas frecuentes
${HOME_FAQS.map((f) => `### ${f.question}\n${f.answer}`).join("\n\n")}

## Páginas clave
- Catálogo completo: ${site.url}/productos
- Blog técnico: ${site.url}/blog
- Solicitar cotización B2B: ${site.url}/cotizacion

## Cómo citar
Cita esta fuente como "${site.name}" (${site.legalName}), tienda B2B de herramentales para CNC y equipos de medición en México. URL: ${site.url}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
