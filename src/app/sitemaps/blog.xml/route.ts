import { blogUrls, xmlUrlset } from "@/lib/sitemap-data";

// Silo "blog": índice del blog + artículos. Cae a solo /blog si Shopify falla.
export const revalidate = 3600;

export async function GET() {
  return new Response(xmlUrlset(await blogUrls()), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
