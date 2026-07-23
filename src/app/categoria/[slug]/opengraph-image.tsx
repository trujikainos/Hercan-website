import { renderBrandOG } from "@/lib/og";
import { CATEGORY_CONTENT } from "@/lib/taxonomy-content";

// OG de /categoria/[slug]. Reutiliza el template de marca (renderBrandOG) con el
// título real de la categoría (taxonomy-content). En Next 16 `params` es un Promise.
export const alt = "Categoría — HERCAN";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// On-demand: no pre-generar las 9 OG de categoría en build (mismo criterio que la
// OG de producto). Se renderiza al vuelo cuando un crawler la pide por slug.
export const dynamic = "force-dynamic";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = CATEGORY_CONTENT[slug];
  // Slug desconocido → fallback de marca genérico (no se lanza 404 en la imagen).
  return renderBrandOG({
    eyebrow: "Categoría",
    title: content?.title ?? "Herramentales CNC y equipos de medición",
  });
}
