import { renderBrandOG } from "@/lib/og";

// OG de /categorias (hub). Reutiliza el template de marca con el título del hub.
export const alt = "Categorías — HERCAN";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderBrandOG({
    eyebrow: "Catálogo",
    title: "Categorías de herramental y equipos de medición",
  });
}
