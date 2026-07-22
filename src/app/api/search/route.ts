import { searchProducts } from "@/lib/shopify";

// Live search: el cliente llama /api/search?q=... (debounced). Token server-only.
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? "";
  try {
    const results = await searchProducts(q, 7);
    return Response.json(
      { results },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json({ results: [] });
  }
}
