import { renderBrandOG } from "@/lib/og";

// OG de /iso (hub) — insertos por designación ISO.
export const alt = "Designación ISO — HERCAN";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderBrandOG({
    eyebrow: "Insertos por designación ISO",
    title: "Insertos ISO: CNMG, TNMG, DNMG y más",
  });
}
