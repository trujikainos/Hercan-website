import type { Product } from "./types";

/**
 * SEO / AEO / GEO de la ficha de producto: FUENTE ÚNICA del título, la meta
 * descripción, el H1, los identificadores y las variantes del número de parte.
 *
 * Todo se deriva de los datos del producto en Shopify (título, marca, sku y el
 * metafield specs.mpn), así que aplica igual a los productos de hoy y a cada
 * producto nuevo que se cree, sin tocar nada a mano.
 *
 * Por qué así (catálogo y Search Console, nov 2026):
 * - Los 3,166 productos tienen mpn. En todas las marcas menos Iscar el mpn es el
 *   código de catálogo (Toolmex 11004006, Palbit 111000686, YG 01573TF-MX) y NO
 *   aparecía en el título. En Iscar el mpn es la designación (DGN 3102C IC20) y ya
 *   va en el título.
 * - Había 82 títulos repetidos (mismo nombre, distinto código). Con el número de
 *   parte en el título cada ficha queda única.
 * - El comprador busca de tres formas: por designación compacta ("dgn3102c",
 *   "spmt120408"), por código de catálogo ("2812401", "g5011") y por medida
 *   ("machuelo m8x1.25"). Por eso: nombre + marca + número de parte, y las
 *   variantes de escritura visibles en la ficha.
 */

const GENERIC_BRANDS = new Set(["", "otros", "otro", "otras", "varios", "—", "-"]);

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Nombre del producto sin la marca entre corchetes del final ("… [Iscar]"). */
export function productName(p: Product): string {
  return p.title.replace(/\s*\[[^\]]+\]\s*$/, "").replace(/\s+/g, " ").trim();
}

/** Marca publicable. "Otros" no es una marca: no va en títulos, H1 ni schema. */
export function brandLabel(p: Product): string | null {
  const b = (p.brand ?? "").trim();
  return GENERIC_BRANDS.has(b.toLowerCase()) ? null : b;
}

/** Nombre + marca (la marca solo si no está ya escrita en el nombre). */
export function nameWithBrand(p: Product): string {
  const name = productName(p);
  const brand = brandLabel(p);
  if (!brand || norm(name).includes(norm(brand))) return name;
  return `${name} ${brand}`;
}

/** Número de parte del fabricante (mpn); si no hay, el SKU. */
export function partNumber(p: Product): string {
  return (p.mpn || p.sku || "").trim();
}

/** ¿El número de parte ya está escrito en el nombre? (Iscar: sí; el resto: no). */
export function partNumberInName(p: Product): boolean {
  const pn = partNumber(p);
  return Boolean(pn) && norm(productName(p)).includes(norm(pn));
}

/**
 * Código de catálogo del fabricante cuando difiere del mpn.
 * Iscar: el SKU de HERCAN es "IS" + el código de pedido de Iscar de 7 dígitos
 * (verificado: IS6097025 = Iscar 6097025, DGR 2202J-15D IC328). Los
 * distribuidores y las cotizaciones de Iscar usan ese número.
 */
export function manufacturerCode(p: Product): { label: string; value: string } | null {
  if ((p.brand ?? "").trim().toLowerCase() === "iscar") {
    const m = /^IS(\d{7})$/i.exec((p.sku ?? "").trim());
    if (m) return { label: "Código Iscar", value: m[1] };
  }
  return null;
}

/** SKU interno de HERCAN, solo cuando aporta algo (es distinto del número de parte). */
export function internalSku(p: Product): string | null {
  const s = (p.sku ?? "").trim();
  if (!s || norm(s) === norm(partNumber(p))) return null;
  return s;
}

// Grado de carburo al final de una designación (Iscar IC908, IC20; Palbit PH6920).
const GRADE = /\s+(?:IC|IB|IN|ID|IK|PH)\d+[A-Z]*$/i;
// Designación ISO de inserto dentro del nombre: CCMT 060204-MP, SCMT 09T308-MM, LNMT 1306PNTR.
const ISO_DESIGNATION = /\b([A-Z]{4})\s+(\d{2}T?\d{2,4}[A-Z]*)(-[A-Z0-9]+)?\b/;
// Código de dos piezas "letras + número" que se escribe junto o separado: DGN 3102C, MDJNR 16-4D.
const TWO_PART_CODE = /^([A-Z][A-Z0-9]{1,5})\s+(\d[A-Z0-9.\-]*)$/i;

/**
 * Otras formas en que se escribe el número de parte (sin espacios, sin el grado).
 * Son las que aparecen en Search Console: "dgn3102c", "spmt120408". Se muestran
 * en la ficha ("También se busca como") y van en `alternateName` del schema.
 * Máximo 3, sin repetir lo que ya está escrito tal cual en el nombre o el mpn.
 */
export function partNumberVariants(p: Product): string[] {
  const out: string[] = [];
  const add = (v: string | null | undefined) => {
    if (!v) return;
    const s = v.replace(/\s+/g, " ").trim();
    if (s.length < 4) return;
    out.push(s);
  };

  const pn = partNumber(p);
  if (pn) {
    const sinGrado = pn.replace(GRADE, "").trim();
    if (sinGrado !== pn) add(sinGrado);
    const two = TWO_PART_CODE.exec(sinGrado);
    if (two) add(`${two[1]}${two[2]}`);
  }

  const iso = ISO_DESIGNATION.exec(productName(p).toUpperCase());
  if (iso) {
    const [, forma, tamano, rompevirutas] = iso;
    if (rompevirutas) add(`${forma}${tamano}${rompevirutas}`);
    add(`${forma}${tamano}`);
  }

  // Sin duplicados ni formas que ya estén escritas idénticas en el nombre o el mpn.
  const yaEscrito = [productName(p).toLowerCase(), pn.toLowerCase()];
  const seen = new Set<string>();
  return out
    .filter((v) => {
      const k = v.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      if (k === pn.toLowerCase()) return false;
      // Una forma con espacios que ya está tal cual en el nombre no aporta.
      if (/\s/.test(v) && yaEscrito.some((t) => t.includes(k))) return false;
      return true;
    })
    .slice(0, 3);
}

/** ¿Se puede comprar ahora? (misma regla que la ficha: política DENY). */
export function inStockNow(p: Product): boolean {
  return Boolean(p.variantId) && (p.variantAvailable ?? false) && (p.stock == null || p.stock > 0);
}

/** Precio como texto plano para metadatos y FAQ: "$432.75 USD". */
export function priceText(p: Product): string | null {
  if (p.price == null || !(p.price > 0)) return null;
  const n = p.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `$${n} ${p.currency}`;
}

/** Specs clave en texto corto: "Carburo, TiAlN, Ø 6 mm, 4 filos". */
export function keySpecsText(p: Product): string | null {
  // La designación ISO solo si no está ya escrita en el nombre (en Iscar suele estarlo).
  const iso = p.iso && !norm(productName(p)).includes(norm(p.iso)) ? p.iso : null;
  const s = [
    p.material,
    p.coating,
    p.diameter != null ? `Ø ${p.diameter} mm` : null,
    p.flutes != null ? `${p.flutes} filos` : null,
    iso,
  ].filter((x): x is string => Boolean(x));
  return s.length ? s.join(", ") : null;
}

/**
 * <title> de la ficha. Va como `absolute` (sin el "| HERCAN" del layout): el
 * nombre del sitio ya lo muestra Google aparte (WebSite schema) y esos 9
 * caracteres son los que dejaban fuera al número de parte en el resultado.
 * - Iscar (número de parte ya en el nombre): "Inserto … DGN 3102C IC20 Iscar".
 * - Resto: "Machuelo #8-32 GUN HSS-E Toolmex | 57840080".
 */
export function seoTitle(p: Product): string {
  const base = nameWithBrand(p);
  const pn = partNumber(p);
  return !pn || partNumberInName(p) ? base : `${base} | ${pn}`;
}

/** H1: nombre + marca. El número de parte va justo debajo, en su caja. */
export function seoH1(p: Product): string {
  return nameWithBrand(p);
}

const MAX_DESC = 158;

function fitWords(s: string, max: number): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:.]$/, "")}…`;
}

/**
 * Meta descripción, answer-first: qué es y su número de parte primero; luego
 * specs, disponibilidad y precio, y el cierre. Se van quitando las piezas de menor
 * prioridad hasta que cabe en ~158 caracteres.
 */
export function seoDescription(p: Product): string {
  const name = nameWithBrand(p);
  const pn = partNumber(p);
  const mc = manufacturerCode(p);
  const head = partNumberInName(p)
    ? `${name}${mc ? `, código ${brandLabel(p) ?? ""} ${mc.value}`.replace(/\s+/g, " ") : ""}.`
    : `${name}, número de parte ${pn}.`;
  const specs = keySpecsText(p);
  const price = priceText(p);
  const avail = inStockNow(p)
    ? `En existencia${price ? `, ${price} con IVA` : ""}.`
    : `Sobre pedido${price ? `, ${price} con IVA` : ""}.`;

  const specsTxt = specs ? `${specs}.` : "";
  const tail = "Envío a todo México y cotización por volumen en HERCAN.";
  // Combinaciones en orden de preferencia: la primera que cabe gana. Las specs
  // (únicas por producto) pesan más que el cierre genérico.
  const options = [
    [head, specsTxt, avail, tail],
    [head, specsTxt, avail],
    [head, avail, tail],
    [head, avail],
    [head],
  ].map((xs) => xs.filter(Boolean).join(" "));
  return fitWords(options.find((t) => t.length <= MAX_DESC) ?? options[options.length - 1], MAX_DESC);
}

/** Texto alternativo de la imagen principal. */
export function imageAlt(p: Product): string {
  return `${nameWithBrand(p)}, número de parte ${partNumber(p)}`;
}
