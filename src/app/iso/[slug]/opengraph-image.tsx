import { renderBrandOG } from "@/lib/og";
import { ISO_CONTENT } from "@/lib/taxonomy-content";

// OG de /iso/[slug]. Reutiliza el template de marca (renderBrandOG) con el título
// real de la familia ISO (taxonomy-content). En Next 16 `params` es un Promise.
export const alt = "Designación ISO — HERCAN";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// On-demand: no pre-generar las OG de ISO en build (mismo criterio que la OG de
// producto). Se renderiza al vuelo cuando un crawler la pide por slug.
export const dynamic = "force-dynamic";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = ISO_CONTENT[slug];
  // Slug desconocido → fallback genérico (no se lanza 404 en la imagen).
  return renderBrandOG({
    eyebrow: "Designación ISO",
    title: content?.title ?? "Designaciones ISO de inserto",
  });
}
