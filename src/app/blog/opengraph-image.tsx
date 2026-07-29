import { renderBrandOG } from "@/lib/og";

// OG de /blog (índice del blog).
export const alt = "Blog — HERCAN";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderBrandOG({
    eyebrow: "Blog",
    title: "Guías técnicas de herramental CNC y medición",
  });
}
