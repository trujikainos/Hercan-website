import { renderBrandOG } from "@/lib/og";
import { TIPO_CONTENT } from "@/lib/taxonomy-content";

// OG de /tipo/[slug]. Reutiliza el template de marca (renderBrandOG) con el título
// real del tipo de herramienta (taxonomy-content). En Next 16 `params` es un Promise.
export const alt = "Tipo de herramienta — HERCAN";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// On-demand: no pre-generar las OG de tipo en build (mismo criterio que la OG de
// producto). Se renderiza al vuelo cuando un crawler la pide por slug.
export const dynamic = "force-dynamic";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = TIPO_CONTENT[slug];
  // Slug desconocido → fallback genérico (no se lanza 404 en la imagen).
  return renderBrandOG({
    eyebrow: "Tipo de herramienta",
    title: content?.title ?? "Tipos de herramienta",
  });
}
