/**
 * Cliente del Admin API de Shopify (solo servidor) para crear un Borrador de
 * pedido (draft order) por cada cotización del sitio. Requiere SHOPIFY_ADMIN_TOKEN
 * con scopes write_draft_orders + read_products.
 * Si el token no está configurado, todo es no-op (la cotización funciona igual).
 */
const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const API_VERSION = process.env.SHOPIFY_API_VERSION || "2026-07";

export const isAdminConfigured = Boolean(DOMAIN && ADMIN_TOKEN);

async function adminGraphql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch(`https://${DOMAIN}/admin/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": ADMIN_TOKEN as string,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Admin API ${res.status}: ${await res.text()}`);
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data as T;
}

const VARIANTS_BY_SKU = `
  query VariantsBySku($q: String!, $n: Int!) {
    productVariants(first: $n, query: $q) { nodes { id sku } }
  }`;

/** Resuelve variant IDs (GID de Admin) a partir de los SKU internos. */
async function resolveVariantIdsBySku(skus: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const uniq = [...new Set(skus.filter(Boolean))];
  if (uniq.length === 0) return map;
  const q = uniq.map((s) => `sku:'${s.replace(/['"\\]/g, "")}'`).join(" OR ");
  const data = await adminGraphql<{ productVariants: { nodes: { id: string; sku: string | null }[] } }>(
    VARIANTS_BY_SKU,
    { q, n: Math.min(uniq.length + 5, 100) },
  );
  for (const v of data.productVariants.nodes) if (v.sku) map.set(v.sku, v.id);
  return map;
}

const CREATE_DRAFT = `
  mutation CreateQuoteDraft($input: DraftOrderInput!) {
    draftOrderCreate(input: $input) {
      draftOrder { id name invoiceUrl }
      userErrors { field message }
    }
  }`;

export interface DraftLine {
  name: string;
  qty: number;
  sku?: string | null;
  mpn?: string | null;
}
export interface QuoteDraftInput {
  nombre: string;
  empresa?: string;
  email: string;
  telefono?: string;
  recurring: boolean;
  lines: DraftLine[];
  mensaje?: string;
  currency: string;
  frecuencia?: string;
  duracion?: string;
  fechaInicio?: string;
}

/**
 * Crea el borrador de pedido. Liga cada producto del catálogo por variante
 * (via SKU); los renglones sin match quedan como línea personalizada. Devuelve
 * el nombre y la URL de factura, o null si no está configurado o falla.
 */
export async function createQuoteDraftOrder(
  input: QuoteDraftInput,
): Promise<{ name: string; invoiceUrl: string | null } | null> {
  if (!isAdminConfigured) return null;

  let skuMap = new Map<string, string>();
  try {
    skuMap = await resolveVariantIdsBySku(input.lines.map((l) => l.sku ?? "").filter(Boolean));
  } catch (e) {
    console.error("[cotizacion] resolver SKU→variante", e);
  }

  const lineItems = input.lines.map((l) => {
    const vid = l.sku ? skuMap.get(l.sku) : undefined;
    const qty = Math.max(1, l.qty);
    if (vid) return { variantId: vid, quantity: qty };
    // Sin variante (texto libre o SKU no encontrado): línea personalizada.
    const title = [l.name, l.mpn ? `(N° parte ${l.mpn})` : "", l.sku ? `(SKU ${l.sku})` : ""]
      .filter(Boolean)
      .join(" ");
    return {
      title: title || "Producto solicitado",
      quantity: qty,
      originalUnitPriceWithCurrency: { amount: "0", currencyCode: input.currency },
    };
  });

  const terminos = [
    input.frecuencia ? `frecuencia ${input.frecuencia}` : "",
    input.duracion ? `duración ${input.duracion}` : "",
    input.fechaInicio ? `inicio ${input.fechaInicio}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  const note = [
    `Solicitud web — ${
      input.recurring ? "SUMINISTRO RECURRENTE (cantidades mensuales aprox.)" : "Compra puntual"
    }`,
    input.recurring && terminos ? `Términos: ${terminos}` : "",
    input.empresa ? `Empresa: ${input.empresa}` : "",
    input.telefono ? `Celular / WhatsApp: ${input.telefono}` : "",
    input.mensaje ? `\nMensaje del cliente:\n${input.mensaje}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const draftInput = {
    email: input.email,
    note,
    tags: ["cotizacion-web", input.recurring ? "suministro-recurrente" : "compra-puntual"],
    lineItems,
  };

  const data = await adminGraphql<{
    draftOrderCreate: {
      draftOrder: { id: string; name: string; invoiceUrl: string | null } | null;
      userErrors: { field: string[]; message: string }[];
    };
  }>(CREATE_DRAFT, { input: draftInput });

  const { draftOrder, userErrors } = data.draftOrderCreate;
  if (userErrors?.length) {
    console.error("[cotizacion] draftOrderCreate userErrors", JSON.stringify(userErrors));
    return null;
  }
  return draftOrder ? { name: draftOrder.name, invoiceUrl: draftOrder.invoiceUrl } : null;
}
