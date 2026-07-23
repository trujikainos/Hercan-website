import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { getAllProductHandles, getArticles } from "@/lib/shopify";
import { brandSlug } from "@/lib/catalog";
import { CATEGORY_CONTENT } from "@/lib/taxonomy-content";

// Sitemap dinámico derivado del catálogo completo (cursor). /carrito queda fuera (noindex).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, articles] = await Promise.all([getAllProductHandles(), getArticles(100)]);
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: site.url, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/productos`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${site.url}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${site.url}/cotizacion`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  // Páginas de taxonomía (SEO/AEO): una por marca y una por categoría.
  const brandPages: MetadataRoute.Sitemap = site.brands.map((b) => ({
    url: `${site.url}/marca/${brandSlug(b.name)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const categoryPages: MetadataRoute.Sitemap = Object.keys(CATEGORY_CONTENT).map((slug) => ({
    url: `${site.url}/categoria/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
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
