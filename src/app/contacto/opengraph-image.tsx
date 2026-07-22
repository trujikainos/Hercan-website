import { renderBrandOG } from "@/lib/og";
import { site } from "@/lib/site";

// OG de /contacto. Título real: `Contacto — sucursales en ${branchNames}`
// (src/app/contacto/page.tsx). Los nombres de sucursal salen de site.locations.
const branchNames = site.locations.map((l) => l.name).join(" y ");

export const alt = `Contacto — HERCAN, sucursales en ${branchNames}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderBrandOG({
    eyebrow: "Contacto",
    title: `Sucursales en ${branchNames}`,
  });
}
