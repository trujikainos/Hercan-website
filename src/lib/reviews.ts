import "server-only";

/**
 * RESEÑAS REALES vía Judge.me (comprador verificado). ENV-GATED: sin
 * `JUDGEME_SHOP_DOMAIN` + `JUDGEME_API_TOKEN`, `reviewsEnabled=false` y todo es no-op
 * (no aparece nada, cero llamadas). Al instalar la app y pegar el token en Vercel,
 * las reseñas y el aggregateRating REAL se activan solos. Nunca datos inventados.
 *
 * API (privada, server-side): base https://api.judge.me/api/v1
 *  1. Resolver el product_id interno de Judge.me desde el id de producto de Shopify:
 *     GET /products/-1?shop_domain&api_token&external_id=<id numérico Shopify>
 *  2. Listar reseñas publicadas:
 *     GET /reviews?shop_domain&api_token&product_id=<interno>&per_page=100&published=true
 */

const SHOP = process.env.JUDGEME_SHOP_DOMAIN;
const TOKEN = process.env.JUDGEME_API_TOKEN;
export const reviewsEnabled = Boolean(SHOP && TOKEN);

const API = "https://api.judge.me/api/v1";

export type Review = {
  id: string | number | null;
  rating: number; // 1..5
  title: string | null;
  body: string;
  author: string;
  date: string | null;
  verified: boolean;
  pictures: string[];
};
export type ProductReviews = { average: number; count: number; reviews: Review[] };

// gid://shopify/Product/1234567890 → "1234567890"
function externalIdOf(productGid: string): string | null {
  const n = productGid?.split("/").pop();
  return n && /^\d+$/.test(n) ? n : null;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
async function jm(path: string, params: Record<string, string>): Promise<any | null> {
  try {
    const qs = new URLSearchParams({ shop_domain: SHOP!, api_token: TOKEN!, ...params });
    const res = await fetch(`${API}${path}?${qs.toString()}`, {
      next: { revalidate: 3600 }, // las reseñas cambian poco; 1 h de caché
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function internalProductId(externalId: string): Promise<number | null> {
  const d = await jm("/products/-1", { external_id: externalId });
  const id = d?.product?.id;
  return typeof id === "number" ? id : null;
}

function mapReview(r: any): Review {
  const pics = Array.isArray(r?.pictures) ? r.pictures : [];
  return {
    id: r?.id ?? null,
    rating: Number(r?.rating) || 0,
    title: r?.title || null,
    body: r?.body || "",
    author: r?.reviewer?.name || r?.reviewer_name || r?.name || "Cliente",
    date: r?.created_at || null,
    // "verified" en Judge.me suele ser "buyer" para compra verificada.
    verified: r?.verified === "buyer" || r?.verified === true || Boolean(r?.verified_buyer),
    pictures: pics.map((p: any) => p?.urls?.original || p?.original || (typeof p === "string" ? p : null)).filter(Boolean),
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Reseñas reales de un producto. null = desactivado/sin config; {count:0} = sin reseñas. */
export async function getProductReviews(productGid: string): Promise<ProductReviews | null> {
  if (!reviewsEnabled) return null;
  const ext = externalIdOf(productGid);
  if (!ext) return null;
  const pid = await internalProductId(ext);
  if (pid == null) return { average: 0, count: 0, reviews: [] };
  const d = await jm("/reviews", { product_id: String(pid), per_page: "100", published: "true" });
  const raw = Array.isArray(d?.reviews) ? d.reviews : [];
  const reviews = raw.map(mapReview).filter((r: Review) => r.rating > 0);
  const count = reviews.length;
  const average = count ? reviews.reduce((s: number, r: Review) => s + r.rating, 0) / count : 0;
  return { average: Math.round(average * 10) / 10, count, reviews };
}
