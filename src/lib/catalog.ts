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
 */
export type Scope = { brand?: string; category?: string };

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

  const filtered = products.filter((p) => matches(p, selected));

  // Opciones + conteos facetados (cada facet cuenta sobre los OTROS filtros activos).
  const facetGroups: FacetGroup[] = FACETS.map(({ key, param, label }) => {
    const base = products.filter((p) => matches(p, selected, key));
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
  const ver = Number.isFinite(verRaw) && verRaw > 0 ? verRaw : pageSize;
  const shown = filtered.slice(0, ver);
  const hasMore = filtered.length > ver;

  // querystring de "Mostrar más": conserva filtros y sube `ver`. El scope NO
  // aparece aquí (va en la ruta), así que naturalmente queda fuera.
  const moreParams = new URLSearchParams();
  for (const { param } of FACETS) {
    const list = paramList(param);
    if (list.length) moreParams.set(param, list.join(","));
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
