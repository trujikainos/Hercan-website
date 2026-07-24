import { cache } from "react";
import { getProducts } from "./shopify";
import type { Product } from "./types";
import { CATEGORY_CONTENT, PARA_CONTENT } from "./taxonomy-content";

/**
 * DATOS DEL MEGA MENÚ — derivados del CATÁLOGO REAL (no hardcodeados).
 *
 * Para cada categoría calcula, del inventario real, qué valores EXISTEN en cada
 * eje (tipo de herramienta, material a maquinar ISO 513, recubrimiento, material
 * de herramienta) CON su conteo. El mega menú solo dibuja los ejes que tienen
 * datos en esa categoría (ej. Medición no tiene recubrimiento → no sale), y cada
 * chip enlaza a la INTERSECCIÓN filtrada en /productos (categoría + ese eje).
 *
 * `cache()` de React memoiza por request; `getProducts()` ya está cacheado a nivel
 * de fetch (revalidate). Costo real: una agregación O(n) sobre el catálogo, una vez
 * por request, compartida por el header de todas las páginas.
 */

export type MenuChip = { label: string; href: string; count: number };

export type MenuCategory = {
  slug: string;
  name: string;
  /** Página de taxonomía de la categoría (SEO). */
  href: string;
  total: number;
  tipos: MenuChip[];
  para: MenuChip[];
  recubrimiento: MenuChip[];
  material: MenuChip[];
};

export type MenuData = MenuCategory[];

const MAX_PER_GROUP = 8;

// Etiqueta corta por grupo ISO 513 (los `name` de PARA_CONTENT son descriptivos y
// largos para un chip: "Aluminio y no ferrosos" → "Aluminio").
const SHORT_PARA: Record<string, string> = {
  P: "Acero",
  M: "Inoxidable",
  K: "Fundición",
  N: "Aluminio",
  S: "Superaleaciones",
  H: "Endurecidos",
};

// Valores BASURA en `tipo_herramienta` que NO son un tipo real: "Otro" (relleno) y
// el tag del lote de importación que se coló en el campo (p. ej.
// "carga-catalogo-2026-07-22"). Se excluyen del menú. TODO(datos): pedir a Lucía
// que limpie tipo_herramienta — hoy la mayoría de SKUs trae el tag de carga.
const isJunkTipo = (t: string): boolean =>
  !t ||
  t.toLowerCase() === "otro" ||
  /carga[- ]?cat[aá]logo/i.test(t) ||
  /\d{4}-\d{2}-\d{2}/.test(t);

function qs(params: Record<string, string>): string {
  return `/productos?${new URLSearchParams(params).toString()}`;
}

/** Cuenta productos por clave y devuelve chips ordenados por volumen (desc). */
function chipsFromCounts(
  counts: Map<string, number>,
  toChip: (key: string, count: number) => MenuChip | null,
): MenuChip[] {
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "es"))
    .map(([key, count]) => toChip(key, count))
    .filter((c): c is MenuChip => c !== null)
    .slice(0, MAX_PER_GROUP);
}

function buildCategory(slug: string, name: string, products: Product[]): MenuCategory {
  const inCat = products.filter((p) => p.category === name);

  // Tipo de herramienta (excluye "Otro", que es ruido de Accesorios/Abrasivos).
  const tipoCounts = new Map<string, number>();
  for (const p of inCat) {
    const t = (p.type ?? "").trim();
    if (!isJunkTipo(t)) tipoCounts.set(t, (tipoCounts.get(t) ?? 0) + 1);
  }

  // Material de la HERRAMIENTA (Carburo/HSS/Cobalto) — faceta real.
  const materialCounts = new Map<string, number>();
  for (const p of inCat) {
    const m = (p.material ?? "").trim();
    if (m) materialCounts.set(m, (materialCounts.get(m) ?? 0) + 1);
  }

  // Recubrimiento (TiAlN/TiN/…) — faceta real.
  const coatingCounts = new Map<string, number>();
  for (const p of inCat) {
    const c = (p.coating ?? "").trim();
    if (c) coatingCounts.set(c, (coatingCounts.get(c) ?? 0) + 1);
  }

  // Material a maquinar (ISO 513): un producto cuenta una vez por cada GRUPO
  // (P/M/K/N/S/H) presente en sus valores multi-valor.
  const paraCounts = new Map<string, number>();
  for (const p of inCat) {
    const codes = new Set(
      (p.materialesAMaquinar ?? [])
        .map((m) => m.trim().charAt(0).toUpperCase())
        .filter(Boolean),
    );
    for (const code of codes) paraCounts.set(code, (paraCounts.get(code) ?? 0) + 1);
  }

  // Códigos ISO 513 con página propia (fuente única PARA_CONTENT); etiqueta corta.
  const paraCodes = new Set(Object.values(PARA_CONTENT).map((c) => c.code));

  return {
    slug,
    name,
    href: `/categoria/${slug}`,
    total: inCat.length,
    tipos: chipsFromCounts(tipoCounts, (tipo, count) => ({
      label: tipo,
      href: qs({ categoria: slug, tipo }),
      count,
    })),
    para: chipsFromCounts(paraCounts, (code, count) => {
      if (!paraCodes.has(code)) return null;
      return {
        label: SHORT_PARA[code] ?? code,
        href: qs({ categoria: slug, para: code }),
        count,
      };
    }),
    recubrimiento: chipsFromCounts(coatingCounts, (coating, count) => ({
      label: coating,
      href: qs({ categoria: slug, recubrimiento: coating }),
      count,
    })),
    material: chipsFromCounts(materialCounts, (material, count) => ({
      label: material,
      href: qs({ categoria: slug, material }),
      count,
    })),
  };
}

export const getMenuData = cache(async (): Promise<MenuData> => {
  let products: Product[] = [];
  try {
    products = await getProducts();
  } catch {
    return [];
  }

  const cats = Object.entries(CATEGORY_CONTENT)
    .map(([slug, c]) => buildCategory(slug, c.name, products))
    .filter((c) => c.total > 0)
    // Orden por VOLUMEN (más productos primero) — como espera un comprador B2B.
    .sort((a, b) => b.total - a.total);

  return cats;
});
