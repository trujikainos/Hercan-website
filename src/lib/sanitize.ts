import "server-only";
import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitizador de HTML semi-confiable de Shopify (descripciones de producto y
 * contenido de blog), apto para RSC/Node (isomorphic-dompurify usa jsdom en el
 * servidor). Sustituye al sanitizador regex casero por una librería probada
 * (defensa en profundidad frente a la mutación-XSS que sortea las regex).
 *
 * El contenido lo escribe el admin de la tienda; el catálogo real vendrá de
 * exports de proveedores (Iscar/Toolmex), así que lo tratamos como semi-confiable
 * y lo limpiamos antes de renderizar con dangerouslySetInnerHTML.
 */

// Fuerza atributos seguros en <a> e <img> DESPUÉS de sanear (el hook es global a
// DOMPurify; sólo <a>/<img> se ven afectados y sólo aparecen en el HTML de blog).
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.nodeName === "A") {
    node.setAttribute("rel", "noopener nofollow");
    node.setAttribute("target", "_blank");
  }
  if (node.nodeName === "IMG") {
    const src = node.getAttribute("src") || "";
    if (!/^https?:\/\//i.test(src)) node.removeAttribute("src"); // sólo imágenes https
    else node.setAttribute("loading", "lazy");
  }
});

// Descripción de producto: sólo formato, CERO atributos (máxima superficie cerrada).
const PRODUCT_TAGS = [
  "p", "br", "ul", "ol", "li",
  "strong", "b", "em", "i", "u",
  "h3", "h4", "h5", "span", "small", "sup", "sub",
  "table", "thead", "tbody", "tr", "td", "th",
];

// Contenido de blog: formato rico + enlaces e imágenes con URL validada.
const RICH_TAGS = [
  "p", "br", "hr", "strong", "b", "em", "i", "u", "s", "mark", "small", "sup", "sub",
  "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "blockquote", "pre", "code",
  "a", "img", "figure", "figcaption",
  "table", "thead", "tbody", "tr", "td", "th", "span",
];

// Esquemas permitidos en href/src: http(s), mailto, tel y rutas relativas.
// (Para <img> el hook de arriba exige además https://). Bloquea javascript:/data:.
const SAFE_URI = /^(?:https?:|mailto:|tel:|\/)/i;

export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return "";
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: PRODUCT_TAGS, ALLOWED_ATTR: [] }).trim();
}

export function sanitizeRichHtml(html: string | null | undefined): string {
  if (!html) return "";
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: RICH_TAGS,
    ALLOWED_ATTR: ["href", "src", "alt"],
    ALLOWED_URI_REGEXP: SAFE_URI,
  }).trim();
}
