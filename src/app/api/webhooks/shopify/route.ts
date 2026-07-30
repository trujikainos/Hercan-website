import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { submitToIndexNow } from "@/lib/indexnow";

// Webhook de Shopify para REVALIDACIÓN INSTANTÁNEA de inventario/producto.
// Cuando cambia un producto (venta, cancelación, reabasto, edición), Shopify
// dispara `products/update` → aquí refrescamos su ficha al instante, sin esperar
// a que expire el caché de 60s. Cierra el lag de "sigue mostrando stock viejo".
//
// Requiere el runtime Node (crypto para verificar la firma HMAC).
export const runtime = "nodejs";

const SECRET = process.env.SHOPIFY_WEBHOOK_SECRET || "";

// Verifica la firma HMAC-SHA256 (base64) que Shopify manda en cada webhook.
// Sin firma válida → 401 (nadie puede forzar revalidaciones desde fuera).
function verify(rawBody: string, hmacHeader: string | null): boolean {
  if (!SECRET || !hmacHeader) return false;
  const digest = createHmac("sha256", SECRET).update(rawBody, "utf8").digest("base64");
  try {
    const a = Buffer.from(digest);
    const b = Buffer.from(hmacHeader);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  if (!verify(rawBody, req.headers.get("x-shopify-hmac-sha256"))) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const topic = req.headers.get("x-shopify-topic") || "";
  let payload: { handle?: string } = {};
  try {
    payload = JSON.parse(rawBody);
  } catch {
    /* cuerpo no-JSON: se ignora, pero ya pasó la firma */
  }

  // `products/*` trae el handle → refresca su ficha en el acto.
  const handle = typeof payload.handle === "string" ? payload.handle : null;
  if (handle) {
    revalidatePath(`/producto/${handle}`);
    // INSTANT INDEXING: avisa a IndexNow (Bing/Yandex/…) que la ficha cambió →
    // re-rastreo casi inmediato. Falla en silencio; no bloquea el 2xx a Shopify.
    await submitToIndexNow([`/producto/${handle}`]);
  }
  // El catálogo también muestra badges de stock → refréscalo.
  revalidatePath("/productos");

  // Responder 200 rápido (Shopify reintenta si no recibe 2xx en ~5s).
  return NextResponse.json({ ok: true, topic, revalidated: handle });
}

// Health-check simple (GET) para verificar que la ruta existe en prod.
export function GET() {
  return NextResponse.json({ ok: true, ready: Boolean(SECRET) });
}
