import { renderBrandOG } from "@/lib/og";

// OG de marca por defecto (home y páginas sin OG propia). 1200×630.
export const alt =
  "HERCAN — Herramientas de corte para CNC y equipos de medición";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderBrandOG({
    eyebrow: "Distribuidor B2B en México",
    // Título real de la home (src/app/page.tsx → metadata.title).
    title: "Herramientas de corte para CNC y equipos de medición",
  });
}
