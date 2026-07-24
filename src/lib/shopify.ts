import "server-only";
import { cache } from "react";
import type { Product, Category, Availability, Article } from "./types";
import { MOCK_PRODUCTS, CATEGORIES } from "./mock-data";
import { sanitizeHtml, sanitizeRichHtml } from "./sanitize";

/**
 * Capa de acceso a datos de la tienda.
 * - Con SHOPIFY_STORE_DOMAIN + token → Storefront API (datos reales).
 * - Sin token → datos MOCK para desarrollar el frontend.
 */

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const PUBLIC_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN;
const PRIVATE_TOKEN = process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN;
const API_VERSION = process.env.SHOPIFY_API_VERSION || "2026-07";

export const isShopifyConnected = Boolean(DOMAIN && (PRIVATE_TOKEN || PUBLIC_TOKEN));

function authHeaders(): Record<string, string> {
  // El token privado (solo servidor) tiene límites más altos; se prefiere si existe.
  if (PRIVATE_TOKEN) return { "Shopify-Storefront-Private-Token": PRIVATE_TOKEN };
  return { "X-Shopify-Storefront-Access-Token": PUBLIC_TOKEN as string };
}

export async function storefront<T>(
  query: string,
  variables: Record<string, unknown> = {},
  init?: { cache?: RequestCache; revalidate?: number; signal?: AbortSignal },
): Promise<T> {
  const res = await fetch(`https://${DOMAIN}/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ query, variables }),
    // Timeout por defecto (10s): una lectura lenta de Shopify no debe colgar el
    // render del RSC sin límite (caché fría). El error boundary lo captura y
    // muestra la página de error con marca. Si el llamador pasa su signal, se respeta.
    signal: init?.signal ?? AbortSignal.timeout(10_000),
    ...(init?.cache
      ? { cache: init.cache }
      : { next: { revalidate: init?.revalidate ?? 60 } }),
  });
  if (!res.ok) throw new Error(`Storefront API ${res.status}: ${await res.text()}`);
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data as T;
}

type ShopifyProductNode = {
  id: string;
  handle: string;
  title: string;
  vendor: string;
  productType: string;
  availableForSale: boolean;
  descriptionHtml?: string;
  tags?: string[];
  featuredImage?: { url: string } | null;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  metafields?: ({ key: string; value: string } | null)[];
  variants?: {
    nodes: {
      id: string;
      sku: string | null;
      availableForSale: boolean;
      quantityAvailable: number | null;
    }[];
  };
};

/**
 * Ficha técnica: metafields del namespace "specs" en orden de despliegue y
 * agrupados. `mpn` se maneja aparte (se muestra en el encabezado). Cuando Lucía
 * cargue el catálogo real, estos metafields se llenan por CSV import y la tabla
 * se completa sola. Ver build_shopify_csv.py.
 */
type SpecField = { key: string; label: string; group: string };
const SPEC_FIELDS: SpecField[] = [
  { key: "tipo_herramienta", label: "Tipo de herramienta", group: "Herramienta" },
  { key: "operacion", label: "Operación", group: "Herramienta" },
  { key: "material_herramienta", label: "Material", group: "Herramienta" },
  { key: "recubrimiento", label: "Recubrimiento", group: "Herramienta" },
  { key: "grado", label: "Grado", group: "Herramienta" },
  { key: "material_a_maquinar", label: "Material a maquinar", group: "Herramienta" },
  { key: "dc_diametro_corte", label: "Ø de corte (mm)", group: "Dimensiones" },
  { key: "dconms_diametro_zanco", label: "Ø del zanco (mm)", group: "Dimensiones" },
  { key: "tipo_zanco", label: "Tipo de zanco", group: "Dimensiones" },
  { key: "oal_longitud_total", label: "Longitud total (mm)", group: "Dimensiones" },
  { key: "lf_longitud_corte", label: "Longitud de corte (mm)", group: "Dimensiones" },
  { key: "apmx_prof_max_corte", label: "Prof. máx. de corte (mm)", group: "Dimensiones" },
  { key: "cict_no_filos", label: "N° de filos", group: "Dimensiones" },
  { key: "radio_punta", label: "Radio de punta (mm)", group: "Dimensiones" },
  { key: "angulo_helice", label: "Ángulo de hélice", group: "Dimensiones" },
  { key: "designacion_iso", label: "Designación ISO", group: "Dimensiones" },
  { key: "tolerancia", label: "Tolerancia", group: "Dimensiones" },
  { key: "geometria_rompevirutas", label: "Geometría rompevirutas", group: "Dimensiones" },
  { key: "refrigerante", label: "Refrigerante", group: "Corte" },
  { key: "sentido_corte", label: "Sentido de corte", group: "Corte" },
  { key: "parametros_corte", label: "Parámetros de corte", group: "Corte" },
  { key: "tipo_instrumento", label: "Tipo de instrumento", group: "Medición" },
  { key: "rango_medicion", label: "Rango de medición", group: "Medición" },
  { key: "resolucion", label: "Resolución", group: "Medición" },
  { key: "exactitud", label: "Exactitud", group: "Medición" },
  { key: "tipo_lectura", label: "Tipo de lectura", group: "Medición" },
  { key: "material_instrumento", label: "Material (instrumento)", group: "Medición" },
  { key: "norma", label: "Norma", group: "Medición" },
  { key: "certificado_calibracion", label: "Certificado de calibración", group: "Medición" },
  { key: "salida_datos", label: "Salida de datos", group: "Medición" },
];
// mpn y unidad_venta se muestran en el encabezado / grupo "General", no en specGroups.
// Estos se manejan aparte (encabezado, badge, botón de ficha), no en specGroups.
const SPEC_KEYS = [
  "mpn",
  "unidad_venta",
  "familia",
  "disponibilidad",
  "ficha_tecnica_pdf",
  "video_url",
  ...SPEC_FIELDS.map((f) => f.key),
];
const SPEC_IDENTIFIERS = SPEC_KEYS.map(
  (k) => `{ namespace: "specs", key: "${k}" }`,
).join(", ");

function buildSpecGroups(mf: Map<string, string>) {
  const groups: { group: string; items: { label: string; value: string }[] }[] = [];
  let current: (typeof groups)[number] | null = null;
  for (const f of SPEC_FIELDS) {
    const value = mf.get(f.key);
    if (!value) continue;
    if (!current || current.group !== f.group) {
      current = { group: f.group, items: [] };
      groups.push(current);
    }
    current.items.push({ label: f.label, value });
  }
  return groups;
}

// Vocabularios ISO 13399 para clasificar los tags de Shopify. Solo se usa como
// FALLBACK en la query de listado (sin metafields); en la ficha ganan los metafields.
const MATERIALS = ["Carburo", "HSS", "Cobalto", "Cerámica", "CBN", "PCD", "Diamante"];
const COATINGS = ["TiN", "TiCN", "TiAlN", "AlTiN", "AlCrN", "ZrN", "TiCrN", "CrN", "DLC"];

// Normaliza para comparar sin importar mayúsculas ni acentos ("ALTIN"→"altin",
// "Cerámica"→"ceramica"), porque los exports de proveedor traen grafías variadas.
const norm = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
const MATERIALS_N = MATERIALS.map(norm);
const COATINGS_N = COATINGS.map(norm);

/** Deriva Tipo/Material/Recubrimiento desde los tags cuando no hay metafields. */
function deriveFromTags(tags: string[], vendor: string, productType: string) {
  const nVendor = norm(vendor);
  const nType = norm(productType);
  const material = tags.find((t) => MATERIALS_N.includes(norm(t))) ?? null;
  const coating = tags.find((t) => COATINGS_N.includes(norm(t))) ?? null;
  // El tag restante (que no es marca, categoría, material ni recubrimiento) es el tipo.
  const type =
    tags.find((t) => {
      const n = norm(t);
      return (
        n !== nVendor &&
        n !== nType &&
        !MATERIALS_N.includes(n) &&
        !COATINGS_N.includes(n)
      );
    }) ?? null;
  return { type, material, coating };
}

function mapProduct(n: ShopifyProductNode): Product {
  const amount = parseFloat(n.priceRange.minVariantPrice.amount);
  const availability: Availability = n.availableForSale ? "En stock" : "Sobre pedido";
  const v = n.variants?.nodes?.[0];
  const sku = v?.sku || n.handle.toUpperCase();
  const tags = n.tags ?? [];
  const derived = deriveFromTags(tags, n.vendor, n.productType);
  // Metafields de la ficha (solo presentes en la query de detalle).
  const mf = new Map<string, string>(
    (n.metafields ?? [])
      .filter((m): m is { key: string; value: string } => Boolean(m && m.value))
      .map((m) => [m.key, m.value]),
  );
  const num = (k: string) => {
    const raw = mf.get(k);
    if (!raw) return null;
    const parsed = parseFloat(raw.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : null;
  };
  return {
    id: n.id,
    variantId: v?.id ?? null,
    variantAvailable: v?.availableForSale ?? n.availableForSale,
    stock: v?.quantityAvailable ?? null,
    sku,
    handle: n.handle,
    title: n.title,
    brand: n.vendor || "—",
    category: n.productType || "—",
    mpn: mf.get("mpn") ?? null,
    familia: mf.get("familia") ?? null,
    unidadVenta: mf.get("unidad_venta") ?? null,
    disponibilidad: mf.get("disponibilidad") ?? null,
    fichaTecnicaPdf: mf.get("ficha_tecnica_pdf") ?? null,
    videoUrl: mf.get("video_url") ?? null,
    // Metafields ganan; si no hay (query de listado), derivamos de los tags.
    type: mf.get("tipo_herramienta") ?? derived.type,
    material: mf.get("material_herramienta") ?? derived.material,
    coating: mf.get("recubrimiento") ?? derived.coating,
    diameter: num("dc_diametro_corte"),
    flutes: mf.get("cict_no_filos") ? Number(mf.get("cict_no_filos")) || null : null,
    iso: mf.get("designacion_iso") ?? null,
    // Multi-valor: separa por coma/;. Hoy suele venir 1 ("P-Acero"); soporta N.
    materialesAMaquinar: (mf.get("material_a_maquinar") ?? "")
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter(Boolean),
    availability,
    price: amount > 0 ? amount : null,
    currency: n.priceRange.minVariantPrice.currencyCode || "USD",
    image: n.featuredImage?.url ?? null,
    description: n.descriptionHtml ? sanitizeHtml(n.descriptionHtml) || null : null,
    tags,
    specGroups: buildSpecGroups(mf),
  };
}

const PRODUCT_FIELDS = `
  id handle title vendor productType availableForSale tags
  featuredImage { url }
  priceRange { minVariantPrice { amount currencyCode } }
  variants(first: 1) { nodes { id sku availableForSale quantityAvailable } }`;

// Listado: PRODUCT_FIELDS + los metafields `specs` que el catálogo/menú necesitan de
// forma AUTORITATIVA (no derivados de tags): `material_a_maquinar` (taxonomía /para) y
// `tipo_herramienta` (fill 99% en el catálogo; sin él, p.type caía a deriveFromTags y
// agarraba el tag de lote de importación como "tipo"). 2 metafields → payload mínimo;
// el resto de specs se derivan de tags en el listado y llegan completas en la ficha.
const PRODUCT_LIST_FIELDS = `${PRODUCT_FIELDS}
  metafields(identifiers: [
    { namespace: "specs", key: "material_a_maquinar" },
    { namespace: "specs", key: "tipo_herramienta" }
  ]) { key value }`;

// La ficha de producto además trae la descripción (HTML del admin) y los
// metafields técnicos del namespace "specs".
const PRODUCT_DETAIL_FIELDS = `${PRODUCT_FIELDS} descriptionHtml
  metafields(identifiers: [${SPEC_IDENTIFIERS}]) { key value }`;

const PRODUCTS_QUERY = `
  query Products($first: Int!) {
    products(first: $first) { nodes { ${PRODUCT_LIST_FIELDS} } }
  }`;

// Recorrido del catálogo por cursor (Storefront topa `first` en 250 por página).
const PRODUCTS_PAGE_QUERY = `
  query ProductsPage($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      nodes { ${PRODUCT_LIST_FIELDS} }
      pageInfo { hasNextPage endCursor }
    }
  }`;

// Solo handles (barato) para sitemap y generateStaticParams.
const HANDLES_PAGE_QUERY = `
  query Handles($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      nodes { handle updatedAt }
      pageInfo { hasNextPage endCursor }
    }
  }`;

// Consulta acotada por filtro Shopify (product_type, vendor…) para relacionados/categoría.
const PRODUCTS_SCOPED_QUERY = `
  query ProductsScoped($first: Int!, $query: String!) {
    products(first: $first, query: $query, sortKey: BEST_SELLING) {
      nodes { ${PRODUCT_LIST_FIELDS} }
    }
  }`;

const PRODUCT_BY_HANDLE_QUERY = `
  query Product($handle: String!) {
    product(handle: $handle) { ${PRODUCT_DETAIL_FIELDS} }
  }`;

type ProductsPage = {
  products: {
    nodes: ShopifyProductNode[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
};

// Recorre TODO el catálogo por cursor (250/página, con tope de seguridad). Cada
// página se cachea por separado vía el revalidate de storefront().
async function fetchAllProductNodes(): Promise<ShopifyProductNode[]> {
  const all: ShopifyProductNode[] = [];
  let after: string | null = null;
  for (let i = 0; i < 60; i++) {
    const data: ProductsPage = await storefront<ProductsPage>(PRODUCTS_PAGE_QUERY, {
      first: 250,
      after,
    });
    all.push(...data.products.nodes);
    if (!data.products.pageInfo.hasNextPage) break;
    after = data.products.pageInfo.endCursor;
  }
  return all;
}

// cache(): deduplica el recorrido completo dentro de un mismo render (p. ej. la
// página de catálogo lo usa para el JSON-LD y para el listado a la vez).
const getAllProducts = cache(async (): Promise<Product[]> => {
  const nodes = await fetchAllProductNodes();
  return nodes.map(mapProduct);
});

/**
 * Productos del catálogo.
 * - Sin `limit` → TODO el catálogo (paginado por cursor).
 * - Con `limit` ≤ 250 → una sola consulta ligera (home, muestras).
 */
export async function getProducts(limit?: number): Promise<Product[]> {
  if (!isShopifyConnected) {
    return typeof limit === "number" ? MOCK_PRODUCTS.slice(0, limit) : MOCK_PRODUCTS;
  }
  if (typeof limit === "number" && limit <= 250) {
    const data = await storefront<{ products: { nodes: ShopifyProductNode[] } }>(
      PRODUCTS_QUERY,
      { first: limit },
    );
    return data.products.nodes.map(mapProduct);
  }
  return getAllProducts();
}

type HandlesPage = {
  products: {
    nodes: { handle: string; updatedAt?: string }[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
};

/** Solo handles + fecha (sitemap / prebuild). Recorre todo por cursor. */
export async function getAllProductHandles(): Promise<
  { handle: string; updatedAt?: string }[]
> {
  if (!isShopifyConnected) return MOCK_PRODUCTS.map((p) => ({ handle: p.handle }));
  const out: { handle: string; updatedAt?: string }[] = [];
  let after: string | null = null;
  for (let i = 0; i < 60; i++) {
    const data: HandlesPage = await storefront<HandlesPage>(HANDLES_PAGE_QUERY, {
      first: 250,
      after,
    });
    out.push(...data.products.nodes);
    if (!data.products.pageInfo.hasNextPage) break;
    after = data.products.pageInfo.endCursor;
  }
  return out;
}

// Consulta acotada por filtro Shopify (una sola página). Sanitiza el valor.
async function queryProducts(first: number, query: string): Promise<Product[]> {
  const data = await storefront<{ products: { nodes: ShopifyProductNode[] } }>(
    PRODUCTS_SCOPED_QUERY,
    { first, query },
  );
  return data.products.nodes.map(mapProduct);
}

export async function getProductByHandle(handle: string): Promise<Product | undefined> {
  if (!isShopifyConnected) return MOCK_PRODUCTS.find((p) => p.handle === handle);
  const data = await storefront<{ product: ShopifyProductNode | null }>(
    PRODUCT_BY_HANDLE_QUERY,
    { handle },
  );
  return data.product ? mapProduct(data.product) : undefined;
}

// Escapa el valor para el mini-lenguaje de búsqueda de Shopify (comillas y \).
function safeQueryValue(v: string): string {
  return v.replace(/['"\\]/g, " ").trim();
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const category = CATEGORIES.find((c) => c.slug === categorySlug);
  if (isShopifyConnected && category) {
    // Consulta acotada por product_type (evita traer todo el catálogo).
    return queryProducts(250, `product_type:'${safeQueryValue(category.name)}'`);
  }
  const all = await getProducts();
  return all.filter(
    (p) => p.category.toLowerCase().replace(/[^a-z0-9]+/g, "-") === categorySlug,
  );
}

export async function getCategories(): Promise<Category[]> {
  return CATEGORIES;
}

/**
 * Filtros de similitud del MÁS específico al MÁS amplio (mismas características).
 * Usa los tags de spec (tipo/material/recubrimiento) que el catálogo real trae por
 * SKU (ver build_shopify_csv.py → tags()). Con datos escasos cae a categoría → marca.
 * Cuando cargue el catálogo real, los tiers específicos empiezan a matchear solos.
 */
function similarityTiers(product: Product): string[] {
  const cat = `product_type:'${safeQueryValue(product.category)}'`;
  const type = product.type ? `tag:'${safeQueryValue(product.type)}'` : null;
  const material = product.material ? `tag:'${safeQueryValue(product.material)}'` : null;
  const coating = product.coating ? `tag:'${safeQueryValue(product.coating)}'` : null;
  const specs = [type, material, coating].filter(Boolean) as string[];
  const tiers: string[] = [];
  if (specs.length >= 2) tiers.push([cat, ...specs].join(" AND ")); // categoría + todas las specs
  if (type && material) tiers.push([cat, type, material].join(" AND ")); // categoría + tipo + material
  if (type) tiers.push([cat, type].join(" AND ")); // categoría + tipo
  tiers.push(cat); // misma categoría
  tiers.push(`vendor:'${safeQueryValue(product.brand)}'`); // misma marca
  return [...new Set(tiers)];
}

/** Recorre los tiers acumulando hasta `limit`, opcionalmente solo en stock. */
async function collectByTiers(
  product: Product,
  { inStockOnly, limit }: { inStockOnly: boolean; limit: number },
): Promise<Product[]> {
  const AVAIL = "available_for_sale:true";
  const ok = (p: Product) =>
    p.handle !== product.handle &&
    (!inStockOnly || ((p.variantAvailable ?? false) && (p.stock == null || p.stock > 0)));
  const seen = new Set<string>([product.handle]);
  const pool: Product[] = [];
  const tiers = [...similarityTiers(product), ...(inStockOnly ? [AVAIL] : [])];
  for (const base of tiers) {
    if (pool.length >= limit) break;
    const q = inStockOnly && base !== AVAIL ? `${base} AND ${AVAIL}` : base;
    const list = await queryProducts(limit + 6, q);
    for (const p of list) {
      if (seen.has(p.handle) || !ok(p)) continue;
      seen.add(p.handle);
      pool.push(p);
      if (pool.length >= limit) break;
    }
  }
  return pool.slice(0, limit);
}

/** Productos relacionados: por características (specs → categoría → marca). */
export async function getRelatedProducts(product: Product, limit = 8): Promise<Product[]> {
  if (isShopifyConnected) {
    const pool = await collectByTiers(product, { inStockOnly: false, limit });
    if (pool.length > 0) return pool;
  }
  // Fallback (modo mock o sin resultados): deriva del listado disponible.
  const all = await getProducts();
  const others = all.filter((p) => p.handle !== product.handle);
  const sameCat = others.filter((p) => p.category === product.category);
  const sameBrand = others.filter(
    (p) => p.category !== product.category && p.brand === product.brand,
  );
  const rest = others.filter(
    (p) => p.category !== product.category && p.brand !== product.brand,
  );
  return [...sameCat, ...sameBrand, ...rest].slice(0, limit);
}

/**
 * Alternativas EN STOCK con las mismas características (para productos agotados).
 * Mismo matching por specs que los relacionados, pero solo con existencia real.
 */
export async function getInStockAlternatives(product: Product, limit = 4): Promise<Product[]> {
  if (isShopifyConnected) {
    const pool = await collectByTiers(product, { inStockOnly: true, limit });
    if (pool.length > 0) return pool;
  }
  const all = await getProducts();
  return all
    .filter(
      (p) =>
        p.handle !== product.handle &&
        (p.variantAvailable ?? false) &&
        (p.stock == null || p.stock > 0),
    )
    .slice(0, limit);
}

// ---- Live search (Storefront predictiveSearch) ----
export interface SearchResult {
  title: string;
  handle: string;
  image: string | null;
  available: boolean;
  sku: string | null; // SKU interno de Hercan (variante)
  mpn: string | null; // N° de parte del fabricante (metafield specs.mpn)
  price: number | null; // precio de lista (minVariantPrice); null si placeholder/0
  currency: string; // ISO del precio, p. ej. "USD"
}

// products(query) indexa título, marca, tipo Y SKU de variante → busca por nombre
// o por número de parte (clave para B2B). Además, la fórmula de título incluye el
// N° de parte (MPN), así que el full-text del título ya matchea el MPN aunque sea
// un metafield. Devolvemos sku + mpn para mostrarlos y adjuntarlos a la cotización.
const SEARCH_QUERY = `
  query Search($q: String!, $limit: Int!) {
    products(first: $limit, query: $q, sortKey: RELEVANCE) {
      nodes {
        title handle
        featuredImage { url }
        priceRange { minVariantPrice { amount currencyCode } }
        variants(first: 1) { nodes { availableForSale sku } }
        mpn: metafield(namespace: "specs", key: "mpn") { value }
      }
    }
  }`;

type SearchNode = {
  title: string;
  handle: string;
  featuredImage?: { url: string } | null;
  priceRange?: { minVariantPrice: { amount: string; currencyCode: string } } | null;
  variants?: { nodes: { availableForSale: boolean; sku: string | null }[] };
  mpn?: { value: string } | null;
};

export async function searchProducts(query: string, limit = 7): Promise<SearchResult[]> {
  // Sanitiza operadores de búsqueda y agrega wildcard de prefijo
  const term = query.trim().replace(/[():"*\\]/g, " ").trim();
  if (!isShopifyConnected || term.length < 2) return [];
  const data = await storefront<{ products: { nodes: SearchNode[] } }>(
    SEARCH_QUERY,
    { q: `${term}*`, limit },
    { cache: "no-store" },
  );
  return (data.products?.nodes ?? []).map((p) => {
    // Precio de lista de la variante mínima; 0/placeholder → null (desconocido),
    // igual que mapProduct(), para no mostrar "$0.00" mientras se cargan precios.
    const amount = parseFloat(p.priceRange?.minVariantPrice?.amount ?? "");
    return {
      title: p.title,
      handle: p.handle,
      image: p.featuredImage?.url ?? null,
      available: p.variants?.nodes?.[0]?.availableForSale ?? true,
      sku: p.variants?.nodes?.[0]?.sku ?? null,
      mpn: p.mpn?.value ?? null,
      price: Number.isFinite(amount) && amount > 0 ? amount : null,
      currency: p.priceRange?.minVariantPrice?.currencyCode ?? "USD",
    };
  });
}

// ---- Blog (Shopify nativo, vía Storefront API) ----
const BLOG_HANDLE = process.env.SHOPIFY_BLOG_HANDLE || "news";

const ARTICLE_FIELDS = `
  id handle title excerpt publishedAt
  image { url altText }
  authorV2 { name }`;

const ARTICLES_QUERY = `
  query Articles($blog: String!, $first: Int!) {
    blog(handle: $blog) {
      articles(first: $first, sortKey: PUBLISHED_AT, reverse: true) {
        nodes { ${ARTICLE_FIELDS} }
      }
    }
  }`;

const ARTICLE_BY_HANDLE_QUERY = `
  query Article($blog: String!, $handle: String!) {
    blog(handle: $blog) {
      articleByHandle(handle: $handle) {
        ${ARTICLE_FIELDS}
        contentHtml
        seo { title description }
      }
    }
  }`;

type ShopifyArticleNode = {
  id: string;
  handle: string;
  title: string;
  excerpt: string | null;
  contentHtml?: string;
  publishedAt: string;
  image?: { url: string; altText: string | null } | null;
  authorV2?: { name: string } | null;
  seo?: { title: string | null; description: string | null } | null;
};

function mapArticle(n: ShopifyArticleNode): Article {
  return {
    id: n.id,
    handle: n.handle,
    title: n.title,
    excerpt: n.excerpt || null,
    contentHtml: n.contentHtml ? sanitizeRichHtml(n.contentHtml) || null : null,
    publishedAt: n.publishedAt,
    image: n.image?.url ?? null,
    imageAlt: n.image?.altText ?? null,
    author: n.authorV2?.name ?? null,
    seoTitle: n.seo?.title ?? null,
    seoDescription: n.seo?.description ?? null,
  };
}

export async function getArticles(first = 24): Promise<Article[]> {
  if (!isShopifyConnected) return [];
  const data = await storefront<{
    blog: { articles: { nodes: ShopifyArticleNode[] } } | null;
  }>(ARTICLES_QUERY, { blog: BLOG_HANDLE, first });
  return (data.blog?.articles?.nodes ?? []).map(mapArticle);
}

export async function getArticleByHandle(handle: string): Promise<Article | null> {
  if (!isShopifyConnected) return null;
  const data = await storefront<{
    blog: { articleByHandle: ShopifyArticleNode | null } | null;
  }>(ARTICLE_BY_HANDLE_QUERY, { blog: BLOG_HANDLE, handle });
  const a = data.blog?.articleByHandle;
  return a ? mapArticle(a) : null;
}
