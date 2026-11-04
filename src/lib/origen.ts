/**
 * Origen de la visita → pedido. Base medible de la comisión por venta originada.
 *
 * Problema que resuelve: el checkout corre en el dominio de Shopify, así que GA4 y
 * Shopify ven todos los pedidos como "Directo" (llegan desde hercan.com.mx). Aquí
 * se guarda en una cookie propia DE DÓNDE llegó el visitante (Google, una IA, una
 * campaña…) y por qué página entró; al crear el carrito o el borrador de
 * cotización, eso viaja a Shopify como atributos ocultos (`_origen_*`) y etiquetas,
 * y queda pegado al pedido para siempre.
 *
 * Sin datos personales: solo el canal, el dominio de donde vino, la página de
 * entrada, los parámetros utm y la fecha. Isomórfico (cliente y servidor).
 */

export const ORIGEN_COOKIE = "hercan_origen";
export const ORIGEN_MAX_AGE = 60 * 60 * 24 * 90; // 90 días

export type Canal = "organico" | "ia" | "pago" | "social" | "campana" | "referido" | "directo";

export const CANAL_LABEL: Record<Canal, string> = {
  organico: "Búsqueda orgánica",
  ia: "Asistente de IA",
  pago: "Publicidad pagada",
  social: "Redes sociales",
  campana: "Campaña (utm)",
  referido: "Otro sitio",
  directo: "Directo",
};

/** Un "toque": cómo llegó el visitante en una visita. */
export type Toque = {
  c: Canal; // canal
  f: string; // fuente: dominio de origen o utm_source ("google.com", "chatgpt.com"…)
  e: string; // página de entrada (ruta, sin query)
  u?: string; // utm "source/medium/campaign" si vino
  t: string; // fecha ISO (día)
};

/** Primer toque (90 días) y último toque que no fue directo. */
export type Origen = { p: Toque; l?: Toque };

const IA = /(^|\.)(chatgpt\.com|chat\.openai\.com|openai\.com|perplexity\.ai|copilot\.microsoft\.com|copilot\.com|gemini\.google\.com|bard\.google\.com|claude\.ai|meta\.ai|deepseek\.com|you\.com|phind\.com|grok\.com)$/i;
const BUSCADOR = /(^|\.)(google\.[a-z.]+|bing\.com|duckduckgo\.com|yahoo\.com|search\.yahoo\.com|ecosia\.org|yandex\.[a-z.]+|search\.brave\.com|baidu\.com|qwant\.com)$/i;
const SOCIAL = /(^|\.)(facebook\.com|fb\.com|instagram\.com|linkedin\.com|lnkd\.in|t\.co|x\.com|twitter\.com|tiktok\.com|youtube\.com|youtu\.be|pinterest\.[a-z.]+|whatsapp\.com|wa\.me|l\.wl\.co|threads\.net)$/i;
const PAGO_MEDIUM = /^(cpc|ppc|paid|paidsearch|paid_search|paidsocial|paid_social|cpm|display|ads?)$/i;
// Dominios propios: navegar entre ellos (o volver del checkout) no es una visita nueva.
const PROPIOS = /(^|\.)(hercan\.com\.mx|myshopify\.com|shopify\.com|shop\.app|vercel\.app|localhost)$/i;

const host = (ref: string): string => {
  try {
    return new URL(ref).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
};

/**
 * Clasifica una visita. Devuelve null si es navegación interna (no cuenta como
 * toque nuevo). `params` = query string de la página de entrada.
 */
export function clasificar(referrer: string, params: URLSearchParams, entrada: string, hoy: string): Toque | null {
  const h = host(referrer);
  const us = params.get("utm_source")?.trim() ?? "";
  const um = params.get("utm_medium")?.trim() ?? "";
  const uc = params.get("utm_campaign")?.trim() ?? "";
  // "source/medium/campaign", sin las diagonales sobrantes cuando faltan piezas.
  const utm = us || um || uc ? [us, um, uc].join("/").replace(/\/+$/, "").slice(0, 120) : undefined;
  const base = { e: entrada.slice(0, 200), t: hoy, ...(utm ? { u: utm } : {}) };

  if (h && PROPIOS.test(h) && !utm) return null;

  // Pago: clic de Google/Microsoft Ads o utm_medium de pago.
  if (params.has("gclid") || params.has("gbraid") || params.has("wbraid") || params.has("msclkid") || PAGO_MEDIUM.test(um)) {
    return { c: "pago", f: us || h || "ads", ...base };
  }
  if (h && IA.test(h)) return { c: "ia", f: h, ...base };
  // ChatGPT y otros mandan utm_source=chatgpt.com sin referrer.
  if (us && IA.test(us.toLowerCase())) return { c: "ia", f: us.toLowerCase(), ...base };
  // Perfil de Google y otros listados marcan sus enlaces con utm_medium=organic.
  if (/^organic$/i.test(um)) return { c: "organico", f: us || h || "organico", ...base };
  if (utm) return { c: "campana", f: us || h || "utm", ...base };
  if (h && BUSCADOR.test(h)) return { c: "organico", f: h, ...base };
  if (h && SOCIAL.test(h)) return { c: "social", f: h, ...base };
  if (params.has("fbclid")) return { c: "social", f: "facebook.com", ...base };
  if (h) return { c: "referido", f: h, ...base };
  return { c: "directo", f: "", ...base };
}

/** Combina el origen guardado con el toque de esta visita. */
export function actualizar(prev: Origen | null, toque: Toque | null): Origen | null {
  if (!toque) return prev;
  if (!prev) return toque.c === "directo" ? { p: toque } : { p: toque, l: toque };
  if (toque.c === "directo") return prev; // lo directo no pisa un último toque real
  return { ...prev, l: toque };
}

export function leerOrigen(raw: string | undefined | null): Origen | null {
  if (!raw) return null;
  try {
    const o = JSON.parse(decodeURIComponent(raw)) as Origen;
    return o && o.p && o.p.c ? o : null;
  } catch {
    return null;
  }
}

export function escribirOrigen(o: Origen): string {
  return encodeURIComponent(JSON.stringify(o));
}

const texto = (t: Toque) =>
  [CANAL_LABEL[t.c], t.f && t.c !== "directo" ? `(${t.f})` : "", `entró por ${t.e || "/"}`, t.u ? `utm ${t.u}` : "", t.t]
    .filter(Boolean)
    .join(" · ");

/**
 * Atributos del carrito / borrador. El "_" inicial los oculta al comprador en el
 * checkout, pero quedan guardados en el pedido (Shopify > pedido > Detalles
 * adicionales) y se leen por API para el corte de comisión.
 */
export function origenAtributos(o: Origen | null): { key: string; value: string }[] {
  if (!o) return [{ key: "_origen_canal", value: "sin-dato" }];
  const ultimo = o.l ?? o.p;
  return [
    { key: "_origen_canal", value: ultimo.c },
    { key: "_origen_fuente", value: ultimo.f || "-" },
    { key: "_origen_entrada", value: ultimo.e || "/" },
    { key: "_origen_detalle", value: texto(ultimo) },
    { key: "_origen_primero", value: texto(o.p) },
    { key: "_origen_sitio", value: "hercan.com.mx" },
  ];
}

/** Etiquetas para el borrador de cotización (se filtran fácil en el admin). */
export function origenEtiquetas(o: Origen | null): string[] {
  const c = (o?.l ?? o?.p)?.c;
  return [c ? `origen-${c}` : "origen-sin-dato"];
}

/** Línea legible para la nota del borrador. */
export function origenNota(o: Origen | null): string {
  if (!o) return "Origen de la visita: sin dato.";
  const ultimo = o.l ?? o.p;
  const distinto = o.l && JSON.stringify(o.l) !== JSON.stringify(o.p);
  return `Origen de la visita: ${texto(ultimo)}${distinto ? ` · primera visita: ${texto(o.p)}` : ""}.`;
}
