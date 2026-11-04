import { site } from "./site";
import { brandSlug } from "./catalog";
import { getProducts } from "./shopify";
import type { Product } from "./types";
import { brandLabel, partNumber, manufacturerCode, nameWithBrand } from "./product-seo";

/**
 * Índice de números de parte por marca (/numeros-de-parte). Es un mapa HTML del
 * catálogo pensado para buscar por código: enlaza las 3,166 fichas con su N° de
 * parte visible, ayuda a Google a descubrirlas y a las IA a resolver "¿qué es el
 * código X?". Se arma solo desde Shopify: cada producto nuevo aparece aquí.
 */

export const OTRAS_MARCAS = { slug: "otras-marcas", name: "Otras marcas" };

export type IndexBrand = { slug: string; name: string };

/** Marcas del índice: las de site.brands en su orden, más "Otras marcas". */
export function indexBrands(): IndexBrand[] {
  return [...site.brands.map((b) => ({ slug: brandSlug(b.name), name: b.name })), OTRAS_MARCAS];
}

export function brandSlugOf(p: Product): string {
  const b = brandLabel(p);
  return b ? brandSlug(b) : OTRAS_MARCAS.slug;
}

export type IndexRow = {
  handle: string;
  partNumber: string;
  code: string | null; // código del fabricante cuando difiere (Iscar)
  name: string;
};

/** Filas de una marca, ordenadas por número de parte. */
export async function partNumberRows(slug: string): Promise<IndexRow[]> {
  const products = await getProducts();
  return products
    .filter((p) => brandSlugOf(p) === slug)
    .map((p) => ({
      handle: p.handle,
      partNumber: partNumber(p),
      code: manufacturerCode(p)?.value ?? null,
      name: nameWithBrand(p),
    }))
    .sort((a, b) => a.partNumber.localeCompare(b.partNumber, "es", { numeric: true }));
}

/** Conteo de productos por marca del índice (para el hub). */
export async function partNumberCounts(): Promise<Record<string, number>> {
  const products = await getProducts();
  const counts: Record<string, number> = {};
  for (const p of products) {
    const s = brandSlugOf(p);
    counts[s] = (counts[s] ?? 0) + 1;
  }
  return counts;
}
