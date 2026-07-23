import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { getAllProductHandles, getArticles } from "@/lib/shopify";
import { brandSlug } from "@/lib/catalog";
import { CATEGORY_CONTENT } from "@/lib/taxonomy-content";

/**
 * Sitemap dinámico auto-derivado de la FUENTE ÚNICA DE VERDAD:
 *   - Estáticas: home + páginas fijas.
 *   - Marcas:     site.brands + brandSlug()  → misma derivación que /marca/[slug].
 *   - Categorías: keys de CATEGORY_CONTENT   → misma derivación que /categoria/[slug].
 *   - Catálogo:   handles reales de Shopify (cursor).
 *   - Blog:       artículos de Shopify (lastModified = fecha real del post).
 * Cero desincronización: agregar una marca/categoría/producto lo mete solo aquí.
 * `/carrito` queda fuera (noindex). Prioridad por palanca SEO: pilares (taxonomía)
 * ≥ hojas (producto). Un fallo transitorio de Shopify no tumba el sitemap: las
 * estáticas + taxonomía siempre se emiten.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, articles] = await Promise.all([
    getAllProductHandles().catch(() => []),
    getArticles(100).catch(() => []),
  ]);
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: site.url, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/productos`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${site.url}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
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

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${site.url}/producto/${p.handle}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const articlePages: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${site.url}/blog/${a.handle}`,
    lastModified: a.publishedAt ? new Date(a.publishedAt) : now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...brandPages, ...categoryPages, ...productPages, ...articlePages];
}
