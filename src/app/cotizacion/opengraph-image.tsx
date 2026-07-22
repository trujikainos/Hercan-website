import { renderBrandOG } from "@/lib/og";

// OG de /cotizacion. Título real: "Solicitar cotización B2B"
// (src/app/cotizacion/page.tsx).
export const alt = "Solicitar cotización B2B — HERCAN";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderBrandOG({
    eyebrow: "Cotización",
    title: "Solicitar cotización B2B",
  });
}
