import "server-only";
import { site } from "@/lib/site";
import { getAllProductHandles, getArticles } from "@/lib/shopify";
import { brandSlug } from "@/lib/catalog";
import {
  CATEGORY_CONTENT,
  TIPO_CONTENT,
  ISO_CONTENT,
  MATERIAL_CONTENT,
  RECUBRIMIENTO_CONTENT,
  PARA_CONTENT,
} from "@/lib/taxonomy-content";

/**
 * Fuente de datos del sitemap, dividida por SILO. La sirven route handlers
 * dedicados (app/sitemap.xml + app/sitemaps/*.xml) porque el auto-índice de
 * generateSitemaps() NO emite /sitemap.xml en la raíz en Next 16 (solo los
 * hijos), y robots.txt necesita ese índice. Ver AGENTS.md.
 *
 * Los tres silos: "paginas" (estáticas + taxonomía pilar), "productos"
 * (hojas reales de Shopify) y "blog" (artículos). Cero desincronización:
 * cada silo se auto-deriva de la misma fuente que sus páginas.
 */

export const SILOS = ["paginas", "productos", "blog"] as const;
export type Silo = (typeof SILOS)[number];

export type UrlEntry = {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const iso = (d: Date | string | undefined, fallback: string) => {
  if (!d) return fallback;
  const dt = d instanceof Date ? d : new Date(d);
  return isNaN(dt.getTime()) ? fallback : dt.toISOString();
};

/** Serializa un <urlset> (un silo). */
export function xmlUrlset(urls: UrlEntry[]): string {
  const body = urls
    .map((u) => {
      const parts = [`    <loc>${esc(u.loc)}</loc>`];
      if (u.lastmod) parts.push(`    <lastmod>${u.lastmod}</lastmod>`);
      if (u.changefreq) parts.push(`    <changefreq>${u.changefreq}</changefreq>`);
      if (u.priority != null) parts.push(`    <priority>${u.priority}</priority>`);
      return `  <url>\n${parts.join("\n")}\n  </url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`;
}

/** Serializa el <sitemapindex> que referencia a cada silo. */
export function xmlIndex(children: { loc: string; lastmod: string }[]): string {
  const body = children
    .map(
      (c) =>
        `  <sitemap>\n    <loc>${esc(c.loc)}</loc>\n    <lastmod>${c.lastmod}</lastmod>\n  </sitemap>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>`;
}

/** URL de un silo dentro del índice. */
export const siloUrl = (silo: Silo) => `${site.url}/sitemaps/${silo}.xml`;

// ── Silo: páginas (estáticas + taxonomía pilar) ──────────────────────────────
export function paginasUrls(): UrlEntry[] {
  const now = new Date().toISOString();
  const staticPages: UrlEntry[] = [
    { loc: site.url, lastmod: now, changefreq: "weekly", priority: 1 },
    { loc: `${site.url}/productos`, lastmod: now, changefreq: "daily", priority: 0.9 },
    // Hubs/archivos de taxonomía (índices): puerta de entrada a cada silo. Peso
    // alto (0.9) porque distribuyen autoridad y rastreo hacia las individuales.
    { loc: `${site.url}/categorias`, lastmod: now, changefreq: "weekly", priority: 0.9 },
    { loc: `${site.url}/marcas`, lastmod: now, changefreq: "weekly", priority: 0.9 },
    { loc: `${site.url}/tipos`, lastmod: now, changefreq: "weekly", priority: 0.9 },
    { loc: `${site.url}/para`, lastmod: now, changefreq: "weekly", priority: 0.9 },
    { loc: `${site.url}/materiales`, lastmod: now, changefreq: "weekly", priority: 0.9 },
    { loc: `${site.url}/recubrimientos`, lastmod: now, changefreq: "weekly", priority: 0.9 },
    { loc: `${site.url}/iso`, lastmod: now, changefreq: "weekly", priority: 0.9 },
    { loc: `${site.url}/cotizacion`, lastmod: now, changefreq: "monthly", priority: 0.7 },
    { loc: `${site.url}/contacto`, lastmod: now, changefreq: "monthly", priority: 0.6 },
    { loc: `${site.url}/nosotros`, lastmod: now, changefreq: "monthly", priority: 0.5 },
  ];

  // Pilares de taxonomía (marca/categoría/tipo/material/recubrimiento): prioridad
  // 0.8, por encima de la hoja de producto (0.7), como manda el modelo
  // pillar-cluster de comercio. ISO a 0.7 (forward-compatible, sin volumen aún).
  const brand = site.brands.map((b): UrlEntry => ({
    loc: `${site.url}/marca/${brandSlug(b.name)}`,
    lastmod: now,
    changefreq: "weekly",
    priority: 0.8,
  }));
  const taxo = (base: string, keys: string[], priority: number): UrlEntry[] =>
    keys.map((slug) => ({
      loc: `${site.url}/${base}/${slug}`,
      lastmod: now,
      changefreq: "weekly",
      priority,
    }));

  return [
    ...staticPages,
    ...brand,
    ...taxo("categoria", Object.keys(CATEGORY_CONTENT), 0.8),
    ...taxo("tipo", Object.keys(TIPO_CONTENT), 0.8),
    ...taxo("material", Object.keys(MATERIAL_CONTENT), 0.8),
    ...taxo("recubrimiento", Object.keys(RECUBRIMIENTO_CONTENT), 0.8),
    // "Para maquinar [material]" (ISO 513: P/M/K/N/S/H): pilar de aplicación,
    // mismo peso 0.8. Faltaba en el sitemap anterior.
    ...taxo("para", Object.keys(PARA_CONTENT), 0.8),
    ...taxo("iso", Object.keys(ISO_CONTENT), 0.7),
  ];
}

// ── Silo: productos ──────────────────────────────────────────────────────────
export async function productosUrls(): Promise<UrlEntry[]> {
  const now = new Date().toISOString();
  const products = await getAllProductHandles().catch(() => []);
  return products.map((p) => ({
    loc: `${site.url}/producto/${p.handle}`,
    lastmod: iso(p.updatedAt, now),
    changefreq: "weekly",
    priority: 0.7,
  }));
}

// ── Silo: blog ───────────────────────────────────────────────────────────────
export async function blogUrls(): Promise<UrlEntry[]> {
  const now = new Date().toISOString();
  const articles = await getArticles(100).catch(() => []);
  return [
    { loc: `${site.url}/blog`, lastmod: now, changefreq: "weekly", priority: 0.7 },
    ...articles.map((a): UrlEntry => ({
      loc: `${site.url}/blog/${a.handle}`,
      lastmod: iso(a.publishedAt, now),
      changefreq: "monthly",
      priority: 0.6,
    })),
  ];
}
