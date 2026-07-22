import Image from "./opengraph-image";
import { site } from "@/lib/site";

// Mismos nombres de sucursal que la OG (derivados de site.locations).
const branchNames = site.locations.map((l) => l.name).join(" y ");

export const alt = `Contacto — HERCAN, sucursales en ${branchNames}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default Image;
