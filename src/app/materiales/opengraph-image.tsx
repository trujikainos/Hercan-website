import { renderBrandOG } from "@/lib/og";

// OG de /materiales (hub) — material de la herramienta (carburo/HSS/cobalto).
export const alt = "Materiales de herramienta — HERCAN";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderBrandOG({
    eyebrow: "Por material de la herramienta",
    title: "Herramienta por material: carburo, HSS y cobalto",
  });
}
