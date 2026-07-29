import { renderBrandOG } from "@/lib/og";
import { PARA_CONTENT } from "@/lib/taxonomy-content";

// OG de /para/[slug] (material a maquinar, ISO 513). Reutiliza el template de marca
// con el título real del material. En Next 16 `params` es un Promise.
export const alt = "Por material a maquinar — HERCAN";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// On-demand: no pre-generar en build (mismo criterio que categoria/[slug]).
export const dynamic = "force-dynamic";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = PARA_CONTENT[slug];
  // Slug desconocido → fallback de marca genérico (no se lanza 404 en la imagen).
  return renderBrandOG({
    eyebrow: "Por material a maquinar",
    title: content?.title ?? "Herramienta por material a maquinar (ISO 513)",
  });
}
