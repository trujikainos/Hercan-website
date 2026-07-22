import { getProductByHandle } from "@/lib/shopify";
import { displayTitle } from "@/components/ui";
import { renderBrandOG } from "@/lib/og";

export const alt = "Producto — HERCAN";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// On-demand: NO pre-generar la OG de los 3,266 productos en build (haría el build
// lentísimo). Se renderiza al vuelo cuando un crawler la pide por handle.
export const dynamic = "force-dynamic";

// OG dinámica por producto: marca (eyebrow) + título + N° de parte (pie). 1200×630.
// En Next 16 `params` es un Promise (breaking change v16.0.0).
export default async function Image({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const p = await getProductByHandle(handle);

  // displayTitle quita el sufijo "[marca]" del título; la marca va en el eyebrow.
  const title = displayTitle(p?.title ?? "Producto");
  const brand = p?.brand?.trim();
  const category = p?.category?.trim();
  const partNo = (p?.mpn ?? p?.sku)?.trim();

  const eyebrow = [brand, category].filter(Boolean).join("  ·  ") || undefined;

  return renderBrandOG({
    title,
    eyebrow,
    // Dato clave de compra B2B; si falta el N° de parte, pie neutro.
    footer: partNo ? `N° de parte: ${partNo}` : "Cotización B2B en línea",
  });
}
