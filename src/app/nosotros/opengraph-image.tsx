import { renderBrandOG } from "@/lib/og";

// OG de /nosotros. Título real: "Nosotros — distribuidor de herramientas de
// corte CNC en Monterrey" (src/app/nosotros/page.tsx), reformateado a eyebrow + título.
export const alt =
  "Nosotros — HERCAN, distribuidor de herramientas de corte CNC en Monterrey";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderBrandOG({
    eyebrow: "Nosotros",
    title: "Distribuidor de herramientas de corte CNC en Monterrey",
  });
}
