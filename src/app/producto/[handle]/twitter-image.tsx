// La card de Twitter/X del producto reutiliza la OG dinámica (mismo default → mismo
// params/handle). `alt`/`size`/`contentType` se declaran literalmente para Next.
import Image from "./opengraph-image";

export const alt = "Producto — HERCAN";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// On-demand (igual que la OG): no pre-generar para los 3,266 productos en build.
export const dynamic = "force-dynamic";

export default Image;
