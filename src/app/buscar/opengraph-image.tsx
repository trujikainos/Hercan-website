import { renderBrandOG } from "@/lib/og";

// OG de /buscar (utilidad).
export const alt = "Buscar — HERCAN";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderBrandOG({
    eyebrow: "Catálogo",
    title: "Busca herramental para CNC y equipos de medición",
  });
}
