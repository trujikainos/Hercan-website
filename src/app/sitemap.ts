import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { getAllProductHandles, getArticles } from "@/lib/shopify";
import { brandSlug } from "@/lib/catalog";
import {
  CATEGORY_CONTENT,
  TIPO_CONTENT,
  ISO_CONTENT,
  MATERIAL_CONTENT,
  RECUBRIMIENTO_CONTENT,
} from "@/lib/taxonomy-content";

/**
 * Sitemap INDEX dividido por silo. Next genera:
 *   - /sitemap.xml            → índice que referencia a los de abajo
 *   - /sitemap/paginas.xml    → estáticas + taxonomía (pilares SEO/AEO)
 *   - /sitemap/productos.xml  → hojas de producto (handles reales de Shopify)
 *   - /sitemap/blog.xml       → artículos del blog
 *
 * Por qué dividir (aunque hoy quepa en un archivo):
 *   1. Diagnóstico en Search Console: cobertura de indexado POR sección
 *      (productos vs pilares vs blog), no todo revuelto.
 *   2. A prueba de futuro: al importar el catálogo ISO 13399 completo de
 *      Iscar/Toolmex se rebasa el tope de 50k URLs/archivo → el índice es
 *      obligatorio. Mejor tenerlo armado desde el día 1.
 *   3. Rastreo eficiente: Google reprocesa solo el sub-sitemap que cambió.
 *
 * Cero desincronización: cada silo se auto-deriva de la MISMA fuente que sus
 * páginas ([slug] de taxonomy-content, handles de Shopify). Un fallo transitorio
 * de Shopify no tumba el índice: cada silo cae a [] si su query falla.
 * `/carrito` queda fuera (noindex).
 */
export async function generateSitemaps(): Promise<{ id: string }[]> {
  return [{ id: "paginas" }, { id: "productos" }, { id: "blog" }];
}

export default async function sitemap({
  id,
}: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const which = await id;
  const now = new Date();

  // ── Silo: productos ────────────────────────────────────────────────────────
  if (which === "productos") {
    const products = await getAllProductHandles().catch(() => []);
    return products.map((p) => ({
      url: `${site.url}/producto/${p.handle}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  }

  // ── Silo: blog ─────────────────────────────────────────────────────────────
  if (which === "blog") {
    const articles = await getArticles(100).catch(() => []);
    return [
      { url: `${site.url}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
      ...articles.map((a) => ({
        url: `${site.url}/blog/${a.handle}`,
        lastModified: a.publishedAt ? new Date(a.publishedAt) : now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ];
  }

  // ── Silo: paginas (estáticas + taxonomía pilar) ────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: site.url, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/productos`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    // Hubs/archivos de taxonomía (índices): puerta de entrada a cada silo. Peso alto
    // (0.9) porque distribuyen autoridad y rastreo hacia las páginas individuales.
    { url: `${site.url}/categorias`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${site.url}/marcas`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${site.url}/tipos`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${site.url}/para`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${site.url}/materiales`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${site.url}/recubrimientos`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${site.url}/iso`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${site.url}/cotizacion`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${site.url}/contacto`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${site.url}/nosotros`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  // Páginas de taxonomía (pilares SEO/AEO): una por marca y una por categoría.
  // Prioridad 0.8 → por encima de la hoja de producto (0.7), como manda el
  // modelo pillar-cluster de comercio.
  const brandPages: MetadataRoute.Sitemap = site.brands.map((b) => ({
    url: `${site.url}/marca/${brandSlug(b.name)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryPages: MetadataRoute.Sitemap = Object.keys(CATEGORY_CONTENT).map((slug) => ({
    url: `${site.url}/categoria/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Tipos de herramienta: mismo peso de pilar que marca/categoría (0.8).
  const tipoPages: MetadataRoute.Sitemap = Object.keys(TIPO_CONTENT).map((slug) => ({
    url: `${site.url}/tipo/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Materiales de herramienta: faceta real poblada → mismo peso de pilar (0.8).
  const materialPages: MetadataRoute.Sitemap = Object.keys(MATERIAL_CONTENT).map((slug) => ({
    url: `${site.url}/material/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Recubrimientos: faceta real poblada → mismo peso de pilar (0.8).
  const recubrimientoPages: MetadataRoute.Sitemap = Object.keys(RECUBRIMIENTO_CONTENT).map(
    (slug) => ({
      url: `${site.url}/recubrimiento/${slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    }),
  );

  // Familias ISO: pilar forward-compatible (hoy sin volumen en el catálogo) → 0.7,
  // un escalón por debajo de tipo/categoría hasta que se importen los insertos.
  const isoPages: MetadataRoute.Sitemap = Object.keys(ISO_CONTENT).map((slug) => ({
    url: `${site.url}/iso/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...brandPages,
    ...categoryPages,
    ...tipoPages,
    ...materialPages,
    ...recubrimientoPages,
    ...isoPages,
  ];
}
