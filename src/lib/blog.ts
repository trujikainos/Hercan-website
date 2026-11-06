import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { Article } from "./types";
import { sanitizeRichHtml } from "./sanitize";

/**
 * Blog de HERCAN, leído del repositorio (no de Shopify) desde el 6 nov 2026.
 *
 * Cada guía vive en `content/blog/<handle>/`:
 *   - `articulo.html`: el cuerpo (h2/h3/p/listas/tablas/enlaces). La última sección
 *     "Preguntas frecuentes" con pares <h3>¿…?</h3><p>…</p> alimenta el schema FAQ.
 *   - `meta.json`: título, SEO, extracto, etiquetas (una `cat:<slug>`), autor, fechas
 *     y portada.
 * Las portadas están en `public/blog/<handle>.jpg` (1600 px) y `<handle>-og.jpg`
 * (1200x630, para redes). La URL pública es la misma de antes: /blog/<handle>.
 *
 * Por qué en el repo: WeEvolveIT escribe las guías; así se revisan completas en el
 * preview antes de publicar, salen en el mismo release que sus enlaces y no dependen
 * de permisos de Shopify. Los artículos originales siguen en el blog "news" de
 * Shopify como respaldo, pero el sitio ya no los lee.
 */
const DIR = path.join(process.cwd(), "content", "blog");

type Meta = {
  handle: string;
  title: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  excerpt?: string | null;
  tags?: string[];
  author?: string | null;
  publishedAt: string;
  updatedAt?: string | null;
  image?: string | null;
  ogImage?: string | null;
  imageAlt?: string | null;
};

let cache: Article[] | null = null;

function load(): Article[] {
  // En producción se lee una vez por instancia; en desarrollo, en cada petición
  // (para ver los cambios a una guía sin reiniciar el servidor).
  if (cache && process.env.NODE_ENV === "production") return cache;
  const handles = fs.existsSync(DIR)
    ? fs.readdirSync(DIR, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)
    : [];
  const articles = handles.flatMap((h): Article[] => {
    const metaPath = path.join(DIR, h, "meta.json");
    const htmlPath = path.join(DIR, h, "articulo.html");
    if (!fs.existsSync(metaPath) || !fs.existsSync(htmlPath)) return [];
    const m = JSON.parse(fs.readFileSync(metaPath, "utf8")) as Meta;
    const html = fs.readFileSync(htmlPath, "utf8");
    return [
      {
        id: `local:${m.handle}`,
        handle: m.handle,
        title: m.title,
        excerpt: m.excerpt || null,
        contentHtml: sanitizeRichHtml(html) || null,
        publishedAt: m.publishedAt,
        updatedAt: m.updatedAt ?? null,
        image: m.image ?? null,
        ogImage: m.ogImage ?? null,
        imageAlt: m.imageAlt ?? null,
        author: m.author ?? null,
        tags: m.tags ?? [],
        seoTitle: m.seoTitle ?? null,
        seoDescription: m.seoDescription ?? null,
      },
    ];
  });
  // Más reciente primero, como lo devolvía Shopify (sortKey PUBLISHED_AT, reverse).
  articles.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  cache = articles;
  return articles;
}

export async function getArticles(first = 24): Promise<Article[]> {
  return load().slice(0, first);
}

export async function getArticleByHandle(handle: string): Promise<Article | null> {
  return load().find((a) => a.handle === handle) ?? null;
}
