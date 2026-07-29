import { renderBrandOG } from "@/lib/og";

// OG de /tipos (hub) — tipos de herramienta de corte.
export const alt = "Tipos de herramienta — HERCAN";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderBrandOG({
    eyebrow: "Por tipo de herramienta",
    title: "Tipos de herramienta de corte",
  });
}
