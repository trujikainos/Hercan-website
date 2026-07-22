/**
 * Generador reutilizable de imágenes Open Graph / Twitter de marca (1200×630).
 *
 * Next 16 · convención de archivo `opengraph-image`/`twitter-image` + `ImageResponse`
 * de `next/og` (Satori). Cada archivo `opengraph-image.tsx` de una ruta importa
 * `renderBrandOG` y exporta su propio `alt`/`size`/`contentType`.
 *
 * Doc consultada: node_modules/next/dist/docs/01-app/03-api-reference/
 *   03-file-conventions/01-metadata/opengraph-image.md  (sección "Using Node.js
 *   runtime with local assets") y .../04-functions/image-response.md.
 *
 * Restricciones de Satori tenidas en cuenta:
 *  - Solo flexbox (nada de `display: grid`); todo contenedor con >1 hijo lleva
 *    `display: flex` explícito.
 *  - Presupuesto de 500 KB por imagen (el logo pesa ~42 KB → ~57 KB en base64).
 *  - Fuente por defecto embebida en `next/og` (no se hace fetch remoto de fuentes).
 *
 * El logo (`public/brand/hercan-logo.jpg`, a color sobre blanco) se lee del
 * filesystem con `fs` y se embebe como data URL base64 → no depende de que el
 * sitio esté vivo ni de ningún fetch remoto. Runtime Node.js (por defecto en el
 * App Router; `fs` no existiría en edge).
 */
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { site } from "@/lib/site";

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

/** Línea de confianza con las marcas que distribuye Hercan (dato de site.ts). */
const BRANDS_LINE = site.brands.map((b) => b.name).join("  ·  ");

/** Host del dominio configurado (p. ej. "hercan.com.mx"). */
const SITE_HOST = (() => {
  try {
    return new URL(site.url).host;
  } catch {
    return "hercan.com.mx";
  }
})();

// El logo se lee una sola vez por proceso y se cachea como data URL.
let logoDataUrl: string | undefined;
async function getLogoDataUrl(): Promise<string> {
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
 * fondo navy elegante, logo real sobre tarjeta blanca, barra de acento
 * (espectro navy→steel→sky), título grande y pie con marcas o dato de la página.
 */
export async function renderBrandOG({
  title,
  eyebrow,
  footer = BRANDS_LINE,
}: BrandOGInput): Promise<ImageResponse> {
  const logoSrc = await getLogoDataUrl();
  const clean =
    title.length > 118 ? `${title.slice(0, 117).trimEnd()}…` : title;
  const fontSize = titleFontSize(clean);

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(135deg, #0e3e60 0%, #082a43 58%, #061f31 100%)",
          color: "#ffffff",
          padding: "70px 72px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top: logo real (a color, sobre blanco) en una tarjeta blanca. */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#ffffff",
              borderRadius: 18,
              padding: "20px 30px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.28)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} width={156} height={72} alt="HERCAN" />
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
            }}
          >
            {clean}
          </div>
        </div>

        {/* Bottom: dominio + pie (marcas por defecto, o dato de la página). */}
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
            {SITE_HOST}
          </div>
          {footer ? (
            <div style={{ display: "flex", fontSize: 24, color: "#a9bccb" }}>
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
