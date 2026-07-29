/**
 * Generador reutilizable de imágenes Open Graph / Twitter de marca (1200×630)
 * + helpers para embeber imágenes (logo local y portada remota de Shopify).
 *
 * Next 16 · convención de archivo `opengraph-image`/`twitter-image` + `ImageResponse`
 * de `next/og` (Satori). Cada archivo `opengraph-image.tsx` de una ruta importa
 * de aquí y exporta su propio `alt`/`size`/`contentType`.
 *
 * Doc consultada:
 *  - node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/
 *    01-metadata/opengraph-image.md  → sección "Using Node.js runtime with local
 *    assets" (patrón fs.readFile → data URL base64 para `<img src>`).
 *  - node_modules/next/dist/docs/01-app/03-api-reference/04-functions/
 *    image-response.md  → API de `ImageResponse`, restricciones de Satori.
 *
 * No hay ejemplo documentado de imagen REMOTA en `ImageResponse`; se usa el mismo
 * patrón que para assets locales (data URL base64), pero haciendo `fetch` de la
 * imagen (CDN de Shopify) y convirtiéndola nosotros → así podemos envolver el
 * fetch en try/catch y caer a un fallback si falla (ver fetchRemoteImageDataUrl).
 *
 * Restricciones de Satori tenidas en cuenta:
 *  - Solo flexbox (nada de `display: grid`); todo contenedor con >1 hijo lleva
 *    `display: flex` explícito.
 *  - Presupuesto ~500 KB por imagen (el logo pesa ~42 KB; la portada se pide
 *    redimensionada al CDN y se descarta si es demasiado grande).
 *  - Solo se embeben portadas JPEG/PNG (formatos que el rasterizador decodifica de
 *    forma fiable) → si el CDN sirve otro formato, se cae al template de marca.
 *  - Fuente por defecto embebida en `next/og` (no se hace fetch remoto de fuentes).
 *
 * Runtime Node.js (por defecto en el App Router; `fs`, `fetch` y `Buffer` existen).
 */
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { site } from "@/lib/site";

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

/**
 * Dominio de marca fijo para el pie de la OG. NO se deriva de `site.url` a
 * propósito: en staging `site.url` es el host de Vercel y el cliente quiere que
 * la preview siempre muestre el dominio real de marca.
 */
export const BRAND_DOMAIN = "hercan.com.mx";

/** Línea de confianza con las marcas: top 5 + "y más" para no desbordar la OG 1200px. */
const _brandNames = site.brands.map((b) => b.name);
const BRANDS_LINE =
  _brandNames.slice(0, 5).join("  ·  ") + (_brandNames.length > 5 ? "  ·  y más" : "");

// El logo se lee una sola vez por proceso y se cachea como data URL.
let logoDataUrl: string | undefined;
/** Logo HERCAN (public/brand/hercan-logo.jpg) como data URL base64. */
export async function getBrandLogoDataUrl(): Promise<string> {
  if (!logoDataUrl) {
    // process.cwd() = raíz del proyecto Next (según la doc de opengraph-image).
    const base64 = await readFile(
      join(process.cwd(), "public", "brand", "hercan-logo.jpg"),
      "base64",
    );
    logoDataUrl = `data:image/jpeg;base64,${base64}`;
  }
  return logoDataUrl;
}

// Fondos de OG por familia (public/og/bg-<name>.jpg). JPEG para que Satori los
// decodifique de forma fiable. Cacheados por proceso. Devuelve null si el fondo no
// existe o falla la lectura → el llamador cae al degradado navy plano (nunca 500).
const ogBgCache: Record<string, string | null> = {};
export async function getOgBackgroundDataUrl(
  name: string,
): Promise<string | null> {
  if (!(name in ogBgCache)) {
    try {
      const base64 = await readFile(
        join(process.cwd(), "public", "og", `bg-${name}.jpg`),
        "base64",
      );
      ogBgCache[name] = `data:image/jpeg;base64,${base64}`;
    } catch {
      ogBgCache[name] = null;
    }
  }
  return ogBgCache[name];
}

/**
 * Descarga una imagen remota (portada de producto en el CDN de Shopify) y la
 * devuelve como data URL base64 lista para `<img src>` en `ImageResponse`.
 * Devuelve `null` (sin lanzar) si falla la descarga, el formato no es
 * JPEG/PNG, o el peso excede el presupuesto → el llamador cae al fallback.
 */
export async function fetchRemoteImageDataUrl(
  rawUrl: string,
): Promise<string | null> {
  try {
    // Pide una versión redimensionada al CDN de Shopify para no reventar el
    // presupuesto de Satori (~500 KB por imagen).
    let url = rawUrl;
    try {
      const u = new URL(rawUrl);
      if (u.hostname.endsWith("cdn.shopify.com")) {
        u.searchParams.set("width", "720");
      }
      url = u.toString();
    } catch {
      /* rawUrl no es una URL absoluta → se usa tal cual */
    }

    const res = await fetch(url);
    if (!res.ok) return null;

    const type = (res.headers.get("content-type") ?? "").toLowerCase();
    // Solo formatos que el rasterizador de next/og decodifica de forma fiable.
    if (!type.startsWith("image/jpeg") && !type.startsWith("image/png")) {
      return null;
    }

    const buf = Buffer.from(await res.arrayBuffer());
    // Salvaguarda de tamaño: si sigue siendo enorme, mejor el fallback de marca.
    if (buf.byteLength > 1_500_000) return null;

    return `data:${type};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

export type BrandOGInput = {
  /** Título principal (grande). Único campo obligatorio. */
  title: string;
  /** Etiqueta corta en mayúsculas sobre el título (sección, marca, categoría…). */
  eyebrow?: string;
  /**
   * Texto al pie a la derecha. Por defecto: las marcas que distribuye Hercan.
   * Pasar `""` para ocultarlo (p. ej. en fichas de producto se usa el N° de parte).
   */
  footer?: string;
  /**
   * Nombre del fondo de taller (public/og/bg-<name>.jpg) que va detrás con overlay
   * navy: "cnc" | "fresado" | "torneado" | "medicion". Default: "cnc". Si el fondo
   * no existe, cae al degradado plano.
   */
  background?: string;
};

/** Tamaño de fuente del título según su longitud, para que nunca se desborde. */
function titleFontSize(title: string): number {
  const n = title.length;
  if (n > 78) return 44;
  if (n > 54) return 52;
  if (n > 34) return 60;
  return 66;
}

/**
 * Devuelve un `ImageResponse` 1200×630 con la identidad de HERCAN:
 * fondo navy elegante (o foto de taller con overlay si `background`), logo real
 * sobre tarjeta blanca, barra de acento (espectro navy→steel→sky), título grande
 * y pie con marcas o dato de la página.
 */
export async function renderBrandOG({
  title,
  eyebrow,
  footer = BRANDS_LINE,
  background = "cnc",
}: BrandOGInput): Promise<ImageResponse> {
  const logoSrc = await getBrandLogoDataUrl();
  const bgSrc = background ? await getOgBackgroundDataUrl(background) : null;
  const clean =
    title.length > 118 ? `${title.slice(0, 117).trimEnd()}…` : title;
  const fontSize = titleFontSize(clean);

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          height: "100%",
          width: "100%",
          display: "flex",
          background:
            "linear-gradient(135deg, #0e3e60 0%, #082a43 58%, #061f31 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        {/* Foto de fondo (solo variante con `background`). */}
        {bgSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bgSrc}
            alt=""
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : null}
        {/* Overlay navy: oscurece la izquierda (texto) y deja ver la foto a la derecha. */}
        {bgSrc ? (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              background:
                "linear-gradient(105deg, rgba(6,31,49,0.96) 0%, rgba(8,42,67,0.88) 38%, rgba(8,42,67,0.55) 72%, rgba(14,62,96,0.40) 100%)",
            }}
          />
        ) : null}

        {/* Contenido (encima del fondo). */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "70px 72px",
          }}
        >
          {/* Top: logo real grande, sobre una tarjeta blanca que lo abraza. */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#ffffff",
                borderRadius: 16,
                padding: "10px 16px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.28)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoSrc} width={260} height={120} alt="HERCAN" />
            </div>
          </div>

          {/* Middle: eyebrow + barra de acento + título. */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {eyebrow ? (
              <div
                style={{
                  display: "flex",
                  fontSize: 25,
                  fontWeight: 600,
                  letterSpacing: 4,
                  textTransform: "uppercase",
                  color: "#5e9cc1",
                  marginBottom: 20,
                }}
              >
                {eyebrow}
              </div>
            ) : null}

            <div
              style={{
                display: "flex",
                width: 132,
                height: 11,
                borderRadius: 6,
                background:
                  "linear-gradient(90deg, #0e3e60 0%, #2083a3 50%, #5e9cc1 100%)",
                marginBottom: 26,
              }}
            />

            <div
              style={{
                display: "flex",
                fontSize,
                fontWeight: 800,
                lineHeight: 1.06,
                letterSpacing: -0.5,
                maxWidth: 1010,
                textShadow: bgSrc ? "0 2px 18px rgba(0,0,0,0.45)" : "none",
              }}
            >
              {clean}
            </div>
          </div>

          {/* Bottom: dominio de marca + pie (marcas por defecto, o dato de la página). */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 26,
                fontWeight: 600,
                color: "#5e9cc1",
              }}
            >
              {BRAND_DOMAIN}
            </div>
            {footer ? (
              <div style={{ display: "flex", fontSize: 24, color: "#a9bccb" }}>
                {footer}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
