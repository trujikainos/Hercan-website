import { ImageResponse } from "next/og";
import { getProductByHandle } from "@/lib/shopify";
import { displayTitle } from "@/components/ui";
import {
  renderBrandOG,
  getBrandLogoDataUrl,
  fetchRemoteImageDataUrl,
  OG_SIZE,
  BRAND_DOMAIN,
} from "@/lib/og";

export const alt = "Producto — HERCAN";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// On-demand: NO pre-generar la OG de los 3,266 productos en build (haría el build
// lentísimo). Se renderiza al vuelo cuando un crawler la pide por handle.
export const dynamic = "force-dynamic";

/** Tamaño de fuente del nombre para la columna angosta de la tarjeta de producto. */
function nameFontSize(name: string): number {
  const n = name.length;
  if (n > 66) return 34;
  if (n > 46) return 40;
  if (n > 30) return 46;
  return 52;
}

// OG dinámica por producto. En Next 16 `params` es un Promise (breaking change v16.0.0).
//
// Con imagen de portada → tarjeta de dos columnas: foto del producto (contain,
// sobre blanco) + logo HERCAN + nombre + N° de parte + SKU.
// Sin imagen (hoy el catálogo está al ~0% de portadas) o si el fetch falla →
// cae elegante al template de marca (renderBrandOG). Cuando carguen las imágenes
// reales, la OG las usa automáticamente sin más cambios.
export default async function Image({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const p = await getProductByHandle(handle);

  // displayTitle quita el sufijo "[marca]" del título; la marca va aparte.
  const title = displayTitle(p?.title ?? "Producto");
  const brand = p?.brand?.trim() ?? "";
  const category = p?.category?.trim() ?? "";
  const mpn = p?.mpn?.trim() ?? "";
  const sku = p?.sku?.trim() ?? "";
  // N° de parte = mpn del fabricante; si no hay, cae al sku (igual que la ficha).
  const partNo = mpn || sku;
  const eyebrow = [brand, category].filter(Boolean).join("  ·  ") || undefined;

  // Intenta cargar la portada del CDN de Shopify (null si no hay o si falla).
  const productImg = p?.image
    ? await fetchRemoteImageDataUrl(p.image)
    : null;

  // ── Fallback de marca (sin portada) ──────────────────────────────────────
  if (!productImg) {
    const footerParts = [
      partNo ? `N° de parte: ${partNo}` : null,
      sku && sku !== partNo ? `SKU: ${sku}` : null,
    ].filter(Boolean);
    return renderBrandOG({
      title,
      eyebrow,
      footer: footerParts.join("  ·  ") || "Cotización B2B en línea",
    });
  }

  // ── Tarjeta de producto con portada ──────────────────────────────────────
  const logoSrc = await getBrandLogoDataUrl();
  const name = title.length > 110 ? `${title.slice(0, 109).trimEnd()}…` : title;
  const showSku = Boolean(sku && sku !== partNo);

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "row",
          background:
            "linear-gradient(135deg, #0e3e60 0%, #082a43 58%, #061f31 100%)",
          color: "#ffffff",
          padding: "56px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Izquierda: portada del producto, contain sobre tarjeta blanca. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 470,
            height: "100%",
            background: "#ffffff",
            borderRadius: 24,
            padding: 26,
            boxShadow: "0 12px 34px rgba(0,0,0,0.30)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={productImg}
            width={418}
            height={466}
            alt={name}
            style={{ objectFit: "contain" }}
          />
        </div>

        {/* Derecha: logo + nombre + identificadores. */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flex: 1,
            height: "100%",
            paddingLeft: 48,
          }}
        >
          {/* Encabezado: logo en chip blanco + marca·categoría. */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                alignItems: "center",
                background: "#ffffff",
                borderRadius: 12,
                padding: "8px 14px",
                boxShadow: "0 8px 22px rgba(0,0,0,0.26)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoSrc} width={139} height={64} alt="HERCAN" />
            </div>
            {eyebrow ? (
              <div
                style={{
                  display: "flex",
                  fontSize: 22,
                  fontWeight: 600,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  color: "#5e9cc1",
                  marginTop: 20,
                }}
              >
                {eyebrow}
              </div>
            ) : null}
          </div>

          {/* Nombre del producto + barra de acento. */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                width: 110,
                height: 10,
                borderRadius: 5,
                background:
                  "linear-gradient(90deg, #0e3e60 0%, #2083a3 50%, #5e9cc1 100%)",
                marginBottom: 22,
              }}
            />
            <div
              style={{
                display: "flex",
                fontSize: nameFontSize(name),
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: -0.5,
                maxWidth: 560,
              }}
            >
              {name}
            </div>
          </div>

          {/* Identificadores etiquetados + dominio. */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", flexDirection: "row", gap: 44 }}>
              {partNo ? (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div
                    style={{
                      display: "flex",
                      fontSize: 16,
                      fontWeight: 600,
                      letterSpacing: 2,
                      textTransform: "uppercase",
                      color: "#8aa6bd",
                    }}
                  >
                    N° de parte
                  </div>
                  <div
                    style={{
                      display: "flex",
                      fontSize: 30,
                      fontWeight: 700,
                      color: "#ffffff",
                      marginTop: 4,
                    }}
                  >
                    {partNo}
                  </div>
                </div>
              ) : null}
              {showSku ? (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div
                    style={{
                      display: "flex",
                      fontSize: 16,
                      fontWeight: 600,
                      letterSpacing: 2,
                      textTransform: "uppercase",
                      color: "#8aa6bd",
                    }}
                  >
                    SKU
                  </div>
                  <div
                    style={{
                      display: "flex",
                      fontSize: 30,
                      fontWeight: 700,
                      color: "#ffffff",
                      marginTop: 4,
                    }}
                  >
                    {sku}
                  </div>
                </div>
              ) : null}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 22,
                fontWeight: 600,
                color: "#5e9cc1",
                marginTop: 26,
              }}
            >
              {BRAND_DOMAIN}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
