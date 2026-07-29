import { SILOS, siloUrl, siloLastmods, xmlIndex } from "@/lib/sitemap-data";

// Índice de sitemaps: /sitemap.xml → referencia a /sitemaps/{paginas,productos,blog}.xml.
// robots.txt apunta aquí. Se regenera cada hora (ISR). Cada <lastmod> es la
// fecha REAL del último cambio de su silo (Google solo confía en lastmod verificable).
export const revalidate = 3600;

export async function GET() {
  const lastmods = await siloLastmods();
  const body = xmlIndex(SILOS.map((s) => ({ loc: siloUrl(s), lastmod: lastmods[s] })));
  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
