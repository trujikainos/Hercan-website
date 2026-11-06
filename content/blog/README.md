# Blog de HERCAN

Desde el 6 nov 2026 las guías viven aquí, no en Shopify. El sitio las lee con `src/lib/blog.ts` y las publica en `/blog/<handle>`.

## Una guía = una carpeta

```
content/blog/<handle>/
  articulo.html   cuerpo: h2, h3, p, ul/ol/li, table, strong, a href="/ruta". Sin h1 ni estilos.
  meta.json       título, SEO, extracto, etiquetas, autor, fechas y portada
public/blog/<handle>.jpg      portada, 1600 px de ancho, JPG (~150 KB)
public/blog/<handle>-og.jpg   la misma portada en 1200x630 para redes
```

`meta.json`:

```json
{
  "handle": "mi-guia",
  "title": "Título visible (H1), máx 70 caracteres",
  "seoTitle": "Título para buscadores, máx 60, termina en | HERCAN",
  "seoDescription": "140 a 155 caracteres",
  "excerpt": "1 o 2 frases que se ven arriba de la guía",
  "tags": ["cat:corte", "otra etiqueta"],
  "author": "HERCAN",
  "publishedAt": "2026-11-06T15:00:00Z",
  "updatedAt": "solo si se editó después de publicar",
  "image": "/blog/mi-guia.jpg",
  "ogImage": "/blog/mi-guia-og.jpg",
  "imageAlt": "Descripción de la portada"
}
```

- Una sola etiqueta `cat:` por guía: `cat:corte`, `cat:medicion` o `cat:guias` (ver `src/lib/blog-categories.ts`).
- La última sección es `<h2>Preguntas frecuentes</h2>` con pares `<h3>¿…?</h3><p>…</p>`: de ahí sale el schema FAQ.
- Sin guiones largos (—) ni medios (–) en el texto.
- Portadas desde cualquier imagen:
  `ffmpeg -i origen.png -vf "scale='min(1600,iw)':-2" -q:v 3 public/blog/<handle>.jpg`
  `ffmpeg -i origen.png -vf "scale=1200:630:force_original_aspect_ratio=increase,crop=1200:630" -q:v 4 public/blog/<handle>-og.jpg`
- Para enlazar la guía desde la tienda: `src/lib/blog-links.ts` (catálogo `G`, `RELATED_GUIDES` y `STORE_FOR_GUIDE`).
- Si se edita una guía publicada, poner `updatedAt` para que el sitemap avise a Google.

Los 13 artículos originales siguen en el blog "news" de Shopify como respaldo; el sitio ya no los lee.
