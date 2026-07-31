import type { Article } from "@/lib/types";

/**
 * Categorías del blog. La categoría de un artículo se define por un tag con la
 * convención `cat:<slug>` en Shopify (no choca con los tags de contenido como
 * "medición" o "brocas"). Un artículo debería tener exactamente un `cat:`.
 * Fuente única: agregar aquí una categoría y taguear el artículo → aparece sola
 * en los chips del índice y en el badge de la tarjeta.
 */
export type BlogCategory = { slug: string; label: string; tag: string };

export const BLOG_CATEGORIES: BlogCategory[] = [
  { slug: "corte", label: "Herramientas de corte", tag: "cat:corte" },
  { slug: "medicion", label: "Medición y metrología", tag: "cat:medicion" },
  { slug: "guias", label: "Guías y tablas", tag: "cat:guias" },
  { slug: "noticias", label: "Noticias", tag: "cat:noticias" },
];

/** Categoría de un artículo a partir de su tag `cat:<slug>` (o null si no tiene). */
export function articleCategory(article: Pick<Article, "tags">): BlogCategory | null {
  const tagset = new Set((article.tags ?? []).map((t) => t.toLowerCase()));
  return BLOG_CATEGORIES.find((c) => tagset.has(c.tag)) ?? null;
}

export function categoryBySlug(slug: string): BlogCategory | undefined {
  return BLOG_CATEGORIES.find((c) => c.slug === slug);
}
