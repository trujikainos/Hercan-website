import { searchProducts } from "@/lib/shopify";
import { limited } from "@/lib/rate-limit";

// Live search: el cliente llama /api/search?q=... (debounced). Token server-only.
const noStore = { "Cache-Control": "no-store" };
const empty = (status = 200) => Response.json({ results: [] }, { status, headers: noStore });

export async function GET(request: Request) {
  const q = (new URL(request.url).searchParams.get("q") ?? "").trim();
  // Exige q >= 2: evita quemar la Storefront API con búsquedas vacías o de 1 char.
  if (q.length < 2) return empty();

  // Rate-limit por IP (store durable Upstash; memoria si no está configurado).
  // `x-real-ip` lo pone Vercel con la IP TCP real (no falsificable).
  const ip =
    request.headers.get("x-real-ip")?.trim() ||
    (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() ||
    "unknown";
  if (await limited("search", ip)) return empty(429);

  try {
    const results = await searchProducts(q, 7);
    return Response.json({ results }, { headers: noStore });
  } catch {
    return empty();
  }
}
