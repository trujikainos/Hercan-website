import { paginasUrls, xmlUrlset } from "@/lib/sitemap-data";

// Silo "paginas": home + estáticas + pilares de taxonomía. Se regenera cada hora.
export const revalidate = 3600;

export function GET() {
  return new Response(xmlUrlset(paginasUrls()), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
