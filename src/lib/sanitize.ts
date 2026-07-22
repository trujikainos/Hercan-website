/**
 * Sanitizador conservador para el `descriptionHtml` de Shopify.
 *
 * Estrategia (defensa en profundidad, apta para React Server Components sin DOM):
 *  1. Elimina por completo los bloques con contenido ejecutable o de estilo.
 *  2. Permite SOLO un allowlist de tags de formato y descarta TODOS los atributos.
 *     Al no quedar ningún atributo, desaparece toda la superficie de XSS por
 *     `on*=`, `href="javascript:"`, `src="data:"`, etc.
 *
 * El contenido lo escribe el admin de la tienda, pero el catálogo real se cargará
 * desde exports de proveedores (Iscar/Toolmex), así que tratamos el HTML como
 * semi-confiable y lo limpiamos antes de renderizar.
 */
const ALLOWED_TAGS = new Set([
  "p", "br", "ul", "ol", "li",
  "strong", "b", "em", "i", "u",
  "h3", "h4", "h5", "span", "small", "sup", "sub",
  "table", "thead", "tbody", "tr", "td", "th",
]);

// Sanitizador permisivo para contenido de blog (escrito por staff en el admin
// de Shopify): permite formato rico + enlaces e imágenes con URL validada.
const RICH_TAGS = new Set([
  "p", "br", "hr", "strong", "b", "em", "i", "u", "s", "mark", "small", "sup", "sub",
  "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "blockquote", "pre", "code",
  "a", "img", "figure", "figcaption",
  "table", "thead", "tbody", "tr", "td", "th", "span",
]);

const attr = (attrs: string, name: string): string | null => {
  const m = new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, "i").exec(attrs);
  return m ? (m[2] ?? m[3] ?? "").trim() : null;
};

export function sanitizeRichHtml(html: string | null | undefined): string {
  if (!html) return "";
  const cleaned = html
    .replace(
      /<(script|style|iframe|object|embed|noscript|template|svg|math|form|input|button)[\s\S]*?<\/\1>/gi,
      "",
    )
    .replace(/<!--[\s\S]*?-->/g, "");
  return cleaned
    .replace(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/g, (_m, slash: string, name: string, attrs: string) => {
      const tag = name.toLowerCase();
      if (!RICH_TAGS.has(tag)) return "";
      if (slash) return `</${tag}>`;
      if (tag === "a") {
        const href = attr(attrs, "href") ?? "";
        if (!/^(https?:|mailto:|tel:|\/)/i.test(href)) return "<a>";
        const safe = href.replace(/"/g, "&quot;");
        return `<a href="${safe}" rel="noopener nofollow" target="_blank">`;
      }
      if (tag === "img") {
        const src = attr(attrs, "src") ?? "";
        if (!/^https?:/i.test(src)) return ""; // sin src segura → se descarta
        const alt = (attr(attrs, "alt") ?? "").replace(/"/g, "&quot;");
        return `<img src="${src.replace(/"/g, "&quot;")}" alt="${alt}" loading="lazy">`;
      }
      return `<${tag}>`; // resto: sin atributos
    })
    .trim();
}

export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return "";
  const out = html
    // 1) Bloques peligrosos completos (apertura … contenido … cierre)
    .replace(
      /<(script|style|iframe|object|embed|noscript|template|svg|math)[\s\S]*?<\/\1>/gi,
      "",
    )
    // Comentarios (pueden ocultar condicionales de IE / payloads)
    .replace(/<!--[\s\S]*?-->/g, "")
    // 2) Cada tag: si está permitido lo dejamos SIN atributos; si no, lo borramos.
    .replace(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g, (_m, slash: string, name: string) => {
      const tag = name.toLowerCase();
      return ALLOWED_TAGS.has(tag) ? `<${slash}${tag}>` : "";
    });
  return out.trim();
}
