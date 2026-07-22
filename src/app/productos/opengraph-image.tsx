import { renderBrandOG } from "@/lib/og";

// OG de /productos. Título real: "Catálogo de herramentales CNC y equipos de
// medición" (src/app/productos/page.tsx), reformateado a eyebrow + título.
export const alt =
  "Catálogo de herramentales CNC y equipos de medición — HERCAN";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderBrandOG({
    eyebrow: "Catálogo",
    title: "Herramentales CNC y equipos de medición",
  });
}
