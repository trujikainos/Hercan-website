import type { NextRequest } from "next/server";
import sharp from "sharp";

// Optimizador de OG image: toma la featured image (Shopify CDN) y la sirve como
// JPG 1200x630 (<200 KB) para que el preview cargue en TODAS las plataformas,
// incluido WhatsApp (canal #1 B2B en México), que descarta imágenes pesadas
// (>~600 KB) y no muestra miniatura. Es automático: cualquier página que ponga
// og:image = /api/og-image?src=<featured> obtiene su versión optimizada; y como
// la URL de Shopify incluye ?v=<version>, al cambiar la portada la OG se
// regenera sola (cambia el src → cambia el recurso cacheado).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Solo se optimizan imágenes del CDN de Shopify: evita convertir la ruta en un
// proxy de imágenes abierto (SSRF / abuso de ancho de banda).
const ALLOWED_HOST = "cdn.shopify.com";
const OG_W = 1200;
const OG_H = 630;

export async function GET(request: NextRequest) {
  const src = request.nextUrl.searchParams.get("src");
  if (!src) return new Response("Missing src", { status: 400 });

  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return new Response("Invalid src", { status: 400 });
  }
  if (url.protocol !== "https:" || url.hostname !== ALLOWED_HOST) {
    return new Response("Forbidden host", { status: 403 });
  }

  try {
    // La URL de Shopify es inmutable (lleva ?v=), así que el origen se puede cachear.
    const upstream = await fetch(url.toString(), { cache: "force-cache" });
    if (!upstream.ok) return new Response("Upstream error", { status: 502 });

    const input = Buffer.from(await upstream.arrayBuffer());
    const output = await sharp(input)
      .resize(OG_W, OG_H, { fit: "cover", position: "centre" })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();

    return new Response(new Uint8Array(output), {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Length": String(output.length),
        // Cache agresivo en el CDN: la entrada es inmutable por su ?v=.
        "Cache-Control": "public, max-age=86400, s-maxage=31536000, immutable",
      },
    });
  } catch {
    return new Response("Image processing error", { status: 500 });
  }
}
