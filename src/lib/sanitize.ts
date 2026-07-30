import "server-only";
import sanitizeHtmlLib from "sanitize-html";

/**
 * Sanitizador de HTML semi-confiable de Shopify (descripciones de producto y
 * contenido de blog), apto para RSC/Node y **serverless**. Usa `sanitize-html`
 * (parser puro JS, htmlparser2) en vez de DOMPurify/jsdom: jsdom rompe al
 * empaquetarse en las funciones serverless de Vercel (ERR_REQUIRE_ESM en su cadena
 * de dependencias). Misma política de allowlist que antes.
 *
 * El contenido lo escribe el admin de la tienda; el catálogo real vendrá de exports
 * de proveedores (Iscar/Toolmex), así que lo tratamos como semi-confiable y lo
 * limpiamos antes de renderizar con dangerouslySetInnerHTML.
 */

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

export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return "";
  return sanitizeHtmlLib(html, {
    allowedTags: PRODUCT_TAGS,
    allowedAttributes: {}, // cero atributos
  }).trim();
}

export function sanitizeRichHtml(html: string | null | undefined): string {
  if (!html) return "";
  return sanitizeHtmlLib(html, {
    allowedTags: RICH_TAGS,
    allowedAttributes: { a: ["href"], img: ["src", "alt"] },
    // Esquemas permitidos (bloquea javascript:/data:). Las rutas relativas se
    // permiten por defecto. <img> además SÓLO https (allowedSchemesByTag).
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["https"] },
    allowProtocolRelative: false,
    // Fuerza atributos seguros DESPUÉS de sanear. Distinguimos por destino:
    //  · Enlace INTERNO (href relativo "/..." o al propio dominio) → follow y misma
    //    pestaña: así el contenido del blog reparte "link juice" a categorías y
    //    productos (clave para rankear las páginas que venden).
    //  · Enlace EXTERNO → nofollow + noopener + pestaña nueva (seguridad y no fugar
    //    autoridad a terceros).
    transformTags: {
      a: (tagName, attribs) => {
        const href = attribs.href || "";
        const internal =
          href.startsWith("/") ||
          href.startsWith("#") ||
          href.includes("hercan.com.mx");
        return {
          tagName,
          attribs: internal
            ? { ...attribs, rel: "" }
            : { ...attribs, rel: "noopener nofollow", target: "_blank" },
        };
      },
      img: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, loading: "lazy" },
      }),
    },
  }).trim();
}
