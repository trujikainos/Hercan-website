import Image from "next/image";

/**
 * Imagen de producto con respaldo (fallback) de marca.
 *
 * - Si `src` trae una URL real (CDN de Shopify) se renderiza tal cual con <img>.
 *   Las imágenes remotas NO pasan por next/image a propósito: no hay
 *   `remotePatterns` en next.config, así que next/image lanzaría en runtime.
 *   (Este es el patrón que ya usa el resto del catálogo.)
 * - Si no hay imagen —hoy el catálogo está casi al 0%— se muestra un cuadro de
 *   marca con el ícono HERCAN centrado, para que fichas y tarjetas se vean
 *   limpias y no como un placeholder vacío.
 *
 * El ícono de marca sí usa next/image porque es un asset local de `public/`
 * (mismo patrón que el logo en el header), sin necesidad de `remotePatterns`.
 */

// Ícono de marca (la "H" metálica, fondo transparente). Local en /public/brand.
const BRAND_ICON = "/brand/hercan-favicon.png";

type ProductImageProps = {
  /** URL de la imagen real. `null`/`undefined` → respaldo de marca. */
  src?: string | null;
  /** Texto alternativo (nombre del producto). Describe la imagen real o el cuadro. */
  alt: string;
  /** Clases para el <img> real (aspecto, padding, hover). Rellena el marco padre. */
  imgClassName?: string;
  /** Clases extra para el cuadro de respaldo (p. ej. redondeo si el padre no recorta). */
  fallbackClassName?: string;
  /** Tamaño del ícono de marca en el respaldo. Default: ~46 % del alto del cuadro. */
  iconClassName?: string;
};

export function ProductImage({
  src,
  alt,
  imgClassName = "h-full w-full object-contain",
  fallbackClassName = "",
  iconClassName = "h-[46%] w-auto",
}: ProductImageProps) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} className={imgClassName} />
    );
  }

  // Respaldo de marca: cuadro con degradado acero muy tenue + "H" centrada.
  // Rellena el marco padre (que ya define alto, borde y redondeo) y hereda su
  // recorte, por lo que combina con las imágenes reales sin "brincar" el layout.
  return (
    <div
      role="img"
      aria-label={alt}
      className={`flex h-full w-full items-center justify-center ${fallbackClassName}`}
      style={{
        background:
          "radial-gradient(120% 90% at 50% 12%, rgba(255,255,255,0.75), rgba(255,255,255,0) 55%)," +
          "linear-gradient(157deg, var(--color-hc-soft) 0%, var(--color-hc-metal-light) 100%)",
      }}
    >
      <Image
        src={BRAND_ICON}
        alt=""
        aria-hidden
        width={400}
        height={400}
        className={`select-none opacity-90 drop-shadow-sm ${iconClassName}`}
      />
    </div>
  );
}
