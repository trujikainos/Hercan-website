import type { Product, Category } from "./types";

/**
 * Lógica de listado + filtrado del catálogo universal, EXTRAÍDA de
 * `src/app/productos/page.tsx` para poder reutilizarla en las páginas de
 * taxonomía (`/marca/[slug]`, `/categoria/[slug]`) sin duplicar código.
 *
 * `/productos` la usa SIN scope (todos los filtros). Las páginas de taxonomía la
 * usan con un `scope` fijo (marca o categoría) que se aplica SIEMPRE a la query;
 * ese grupo de faceta se oculta del sidebar (prop `hiddenFacets`) porque la
 * faceta ya viaja en la RUTA, no en los search params.
 *
 * El comportamiento de `/productos` es idéntico al previo: mismos filtros,
 * mismos conteos facetados, misma paginación `?ver=N`.
 */

export type FacetKey = "category" | "brand" | "availability" | "material" | "coating";

export type FacetOption = {
  value: string; // valor que va en la URL (slug para categoría, valor para el resto)
  label: string;
  count: number;
  selected: boolean;
};
export type FacetGroup = {
  param: string;
  label: string;
  options: FacetOption[];
};

/**
 * Faceta fija de una página de taxonomía. Los valores son los REALES del dato
 * (vendor / product_type), no slugs: p. ej. `{ brand: "Iscar" }`,
 * `{ category: "Fresado" }`.
 *
 * `brand`/`category` SON facetas del sidebar → se fuerzan inyectándolas en
 * `selected` (y se ocultan con `hiddenFacets`). `tipo`/`iso` NO son facetas del
 * sidebar: se aplican como predicado extra (`scopeOk`) sobre el dato del producto
 * (`tipo_herramienta` → `p.type`; familia de `designacion_iso` → `p.iso`).
 */
export type Scope = {
  brand?: string;
  category?: string;
  /** Valor EXACTO de `tipo_herramienta` (p. ej. "Inserto", "Fresa/Endmill"). */
  tipo?: string;
  /** Familia ISO 1832 = prefijo de `designacion_iso` (p. ej. "CNMG", "TNMG"). */
  iso?: string;
  /** Valor EXACTO de material de herramienta (Carburo, HSS, Cobalto) — faceta. */
  material?: string;
  /** Valor EXACTO de recubrimiento (TiAlN, TiN, AlCrN…) — faceta. */
  coating?: string;
  /** Prefijo ISO 513 del material a maquinar (P/M/K/N/S/H). Scope por la 1ª letra de
   * cada valor de `materialesAMaquinar` (MULTI-VALOR). NO es faceta del sidebar:
   * predicado extra como tipo/iso. Alimenta `/para/[material]`. */
  para?: string;
};

export const FACETS: { key: FacetKey; param: string; label: string }[] = [
  { key: "category", param: "categoria", label: "Categoría" },
  { key: "brand", param: "marca", label: "Marca" },
  { key: "availability", param: "disponibilidad", label: "Disponibilidad" },
  { key: "material", param: "material", label: "Material" },
  { key: "coating", param: "recubrimiento", label: "Recubrimiento" },
];

export const CATALOG_PAGE_SIZE = 48;

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/** Slug de marca: minúsculas y sin espacios (YG → "yg", KTA → "kta"). */
export const brandSlug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "");

/** Normaliza una designación ISO a mayúsculas alfanuméricas ("CNMG 120408" → "CNMG120408"). */
const normIso = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

/**
 * ¿La designación ISO de un producto pertenece a la familia dada? Compara por
 * PREFIJO normalizado: "CNMG 120408" ∈ "CNMG". Las familias ISO 1832 (CNMG, TNMG,
 * CCMT…) son prefijos de 4 letras mutuamente excluyentes, así que el prefijo
 * identifica la familia sin ambigüedad.
 */
export function isoFamilyMatch(
  productIso: string | null | undefined,
  family: string,
): boolean {
  if (!productIso) return false;
  return normIso(productIso).startsWith(normIso(family));
}

type Selected = Record<FacetKey, string[]>;

/** ¿El producto pasa todos los facets seleccionados, ignorando opcionalmente uno? */
function matches(p: Product, sel: Selected, ignore?: FacetKey): boolean {
  for (const { key } of FACETS) {
    if (key === ignore) continue;
    const chosen = sel[key];
    if (chosen.length === 0) continue;
    const v = p[key];
    if (v == null || !chosen.includes(String(v))) return false;
  }
  return true;
}

export type CatalogResult = {
  filtered: Product[];
  shown: Product[];
  facetGroups: FacetGroup[];
  hasMore: boolean;
  /** querystring SIN "?" para el enlace "Mostrar más" (preserva filtros + sube `ver`). */
  moreQuery: string;
  total: number;
  remaining: number;
};

export function buildCatalog({
  products,
  categories,
  searchParams,
  scope,
  pageSize = CATALOG_PAGE_SIZE,
}: {
  products: Product[];
  categories: Category[];
  searchParams: Record<string, string | string[] | undefined>;
  scope?: Scope;
  pageSize?: number;
}): CatalogResult {
  const nameToSlug = new Map(categories.map((c) => [c.name, c.slug]));
  const slugToName = new Map(categories.map((c) => [c.slug, c.name]));
  const catSlug = (name: string) => nameToSlug.get(name) ?? slugify(name);

  const paramList = (name: string): string[] => {
    const v = searchParams[name];
    const raw = Array.isArray(v) ? v.join(",") : (v ?? "");
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
  };

  // La categoría viaja como slug en la URL (SEO + links del home); el resto por valor.
  const catSlugs = paramList("categoria");
  const selected: Selected = {
    category: catSlugs
      .map((s) => slugToName.get(s))
      .filter((n): n is string => Boolean(n)),
    brand: paramList("marca"),
    availability: paramList("disponibilidad"),
    material: paramList("material"),
    coating: paramList("recubrimiento"),
  };

  // Scope fijo de la taxonomía: fuerza la faceta (ignora cualquier param) y la
  // vuelve implícita — vive en la ruta. El sidebar oculta ese grupo con `hiddenFacets`.
  if (scope?.brand) selected.brand = [scope.brand];
  if (scope?.category) selected.category = [scope.category];
  if (scope?.material) selected.material = [scope.material];
  if (scope?.coating) selected.coating = [scope.coating];

  // Scope NO-faceta (tipo/iso): predicado extra aplicado a TODO (lista + conteos),
  // porque `tipo`/`iso` no viven en `selected`. `tipo` = valor exacto de
  // `tipo_herramienta`; `iso` = familia (prefijo) de `designacion_iso`.
  const scopeOk = (p: Product): boolean => {
    if (scope?.tipo && p.type !== scope.tipo) return false;
    if (scope?.iso && !isoFamilyMatch(p.iso, scope.iso)) return false;
    // Material a maquinar: matchea si ALGÚN valor del producto tiene el prefijo ISO 513
    // del scope (P/M/K/N/S/H). Multi-valor → un producto puede caer en varias páginas.
    if (
      scope?.para &&
      !(p.materialesAMaquinar ?? []).some(
        (m) => m.trim().charAt(0).toUpperCase() === scope.para,
      )
    )
      return false;
    return true;
  };

  const filtered = products.filter((p) => matches(p, selected) && scopeOk(p));

  // Opciones + conteos facetados (cada facet cuenta sobre los OTROS filtros activos,
  // siempre dentro del scope de tipo/iso).
  const facetGroups: FacetGroup[] = FACETS.map(({ key, param, label }) => {
    const base = products.filter((p) => matches(p, selected, key) && scopeOk(p));
    const counts = new Map<string, number>();
    for (const p of base) {
      const v = p[key];
      if (v) counts.set(String(v), (counts.get(String(v)) ?? 0) + 1);
    }
    const options = [...counts.entries()]
      .sort((a, b) => a[0].localeCompare(b[0], "es"))
      .map(([optLabel, count]) => {
        const value = key === "category" ? catSlug(optLabel) : optLabel;
        const isSel =
          key === "category"
            ? catSlugs.includes(value)
            : selected[key].includes(optLabel);
        return { value, label: optLabel, count, selected: isSel };
      });
    return { param, label, options };
  });

  // Paginación por URL: ?ver=N (acumulativo, preserva la UX de "Mostrar más").
  const verRaw = parseInt(paramList("ver")[0] ?? "", 10);
  // Acota ?ver al total disponible (mínimo `pageSize`): evita que ?ver=99999
  // fuerce el render de miles de tarjetas en una sola página (payload/abuso).
  const requested = Number.isFinite(verRaw) && verRaw > 0 ? verRaw : pageSize;
  const ver = Math.min(requested, Math.max(filtered.length, pageSize));
  const shown = filtered.slice(0, ver);
  const hasMore = filtered.length > ver;

  // querystring de "Mostrar más": conserva filtros y sube `ver`. El scope NO
  // aparece aquí (va en la ruta), así que naturalmente queda fuera.
  // Preserva TODOS los params actuales (facetas + `q` de búsqueda + otros) salvo
  // `ver`, para que "Mostrar más" no pierda el término de búsqueda ni los filtros.
  const moreParams = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    if (k === "ver" || v == null) continue;
    const val = Array.isArray(v) ? v.join(",") : v;
    if (val) moreParams.set(k, val);
  }
  moreParams.set("ver", String(ver + pageSize));

  return {
    filtered,
    shown,
    facetGroups,
    hasMore,
    moreQuery: moreParams.toString(),
    total: filtered.length,
    remaining: filtered.length - ver,
  };
}

const normText = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/**
 * Búsqueda de texto libre sobre el catálogo (página `/buscar`). Multi-token AND:
 * cada palabra debe aparecer en el "haystack" del producto, que reúne todos los
 * campos consultables — título, SKU, N° de parte, marca, categoría, tipo,
 * material, recubrimiento, ISO, familia y tags. Devuelve el subconjunto de
 * productos que coinciden; luego `buildCatalog` aplica facetas y paginación
 * sobre ese resultado (así los resultados de búsqueda se pueden filtrar).
 */
export function searchProductsLocal(products: Product[], query: string): Product[] {
  const tokens = normText(query).split(/\s+/).filter(Boolean);
  if (!tokens.length) return [];
  return products.filter((p) => {
    const haystack = normText(
      [
        p.title, p.sku, p.mpn, p.brand, p.category, p.type,
        p.material, p.coating, p.iso, p.familia,
        ...(p.tags ?? []),
      ]
        .filter(Boolean)
        .join(" "),
    );
    return tokens.every((t) => haystack.includes(t));
  });
}
