import { renderBrandOG } from "@/lib/og";

// OG de /recubrimientos (hub).
export const alt = "Recubrimientos — HERCAN";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderBrandOG({
    eyebrow: "Por recubrimiento",
    title: "Herramienta por recubrimiento: TiAlN, TiN, TiCN, AlCrN",
  });
}
