import { renderBrandOG } from "@/lib/og";

// OG de /para (hub) — material a maquinar (ISO 513).
export const alt = "Por material a maquinar — HERCAN";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderBrandOG({
    eyebrow: "Por material a maquinar · ISO 513",
    title: "Herramienta según el material que maquinas",
  });
}
