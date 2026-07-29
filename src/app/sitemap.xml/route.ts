import { SILOS, siloUrl, xmlIndex } from "@/lib/sitemap-data";

// Índice de sitemaps: /sitemap.xml → referencia a /sitemaps/{paginas,productos,blog}.xml.
// robots.txt apunta aquí. Se regenera cada hora (ISR).
export const revalidate = 3600;

export function GET() {
  const lastmod = new Date().toISOString();
  const body = xmlIndex(SILOS.map((s) => ({ loc: siloUrl(s), lastmod })));
  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
