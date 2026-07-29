import { productosUrls, xmlUrlset } from "@/lib/sitemap-data";

// Silo "productos": hojas reales de Shopify (handles). Cae a [] si Shopify falla.
export const revalidate = 3600;

export async function GET() {
  return new Response(xmlUrlset(await productosUrls()), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
