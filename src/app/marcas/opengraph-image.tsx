import { renderBrandOG } from "@/lib/og";

// OG de /marcas (hub).
export const alt = "Marcas — HERCAN";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderBrandOG({
    eyebrow: "Marcas que distribuimos",
    title: "Marcas de herramientas de corte y medición",
  });
}
