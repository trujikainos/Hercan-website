// La card de Twitter/X del material reutiliza la OG dinámica (mismo default → mismo
// params/slug). `alt`/`size`/`contentType` se declaran literalmente para Next.
import Image from "./opengraph-image";

export const alt = "Material de herramienta — HERCAN";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// On-demand (igual que la OG): no pre-generar en build.
export const dynamic = "force-dynamic";

export default Image;
