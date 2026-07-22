import { ImageResponse } from "next/og";
import { getProductByHandle } from "@/lib/shopify";
import { displayTitle } from "@/components/ui";
import type { Product } from "@/lib/types";
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
  if (n > 64) return 32;
  if (n > 44) return 38;
  if (n > 28) return 44;
  return 50;
}

/** Lee un spec por su etiqueta desde specGroups (metafields), de forma segura. */
function specByLabel(p: Product | null | undefined, label: string): string {
  if (!p?.specGroups) return "";
  for (const g of p.specGroups) {
    const item = g.items.find((it) => it.label === label);
    if (item?.value) return item.value.trim();
  }
  return "";
}

type Info = { label: string; value: string };

// OG dinámica por producto. En Next 16 `params` es un Promise (breaking change v16.0.0).
//
// Con imagen de portada → tarjeta de dos columnas: IZQUIERDA la foto (contain, sobre
// blanco) con el SKU superpuesto en una esquina; DERECHA logo HERCAN + nombre grande +
// N° de parte prominente + 3–6 datos clave B2B etiquetados (marca, categoría y specs).
// Sin imagen (hoy el catálogo está al ~0% de portadas) o si el fetch falla → cae al
// template de marca (renderBrandOG). Specs ausentes se omiten (no se inventan).
export default async function Image({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const p = await getProductByHandle(handle);

  // displayTitle quita el sufijo "[marca]" del título.
  const title = displayTitle(p?.title ?? "Producto");
  // brand/category pueden venir como "—" (placeholder) → se tratan como ausentes.
  const brandRaw = p?.brand?.trim() ?? "";
  const brand = brandRaw && brandRaw !== "—" ? brandRaw : "";
  const categoryRaw = p?.category?.trim() ?? "";
  const category = categoryRaw && categoryRaw !== "—" ? categoryRaw : "";
  const mpn = p?.mpn?.trim() ?? "";
  const sku = p?.sku?.trim() ?? "";
  // N° de parte = mpn del fabricante; si no hay, cae al sku (igual que la ficha).
  const partNo = mpn || sku;

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
    const eyebrow = [brand, category].filter(Boolean).join("  ·  ") || undefined;
    return renderBrandOG({
      title,
      eyebrow,
      footer: footerParts.join("  ·  ") || "Cotización B2B en línea",
    });
  }

  // ── Tarjeta de producto con portada ──────────────────────────────────────
  const logoSrc = await getBrandLogoDataUrl();
  const name = title.length > 96 ? `${title.slice(0, 95).trimEnd()}…` : title;

  // Datos clave B2B (etiquetados), en orden de prioridad; se omite lo ausente y no
  // se fabrica nada. Material = material de la herramienta (Carburo/HSS);
  // "Material a maquinar" (P/M/K/N/S/H) vive solo en specGroups.
  const materialWork = specByLabel(p, "Material a maquinar");
  const material = p?.material?.trim() ?? "";
  const coating = p?.coating?.trim() ?? "";
  const iso = p?.iso?.trim() ?? "";
  const disponibilidad = p?.disponibilidad?.trim() ?? "";
  const diameter = p?.diameter ?? null;
  const flutes = p?.flutes ?? null;

  const candidates: (Info | null)[] = [
    brand ? { label: "Marca", value: brand } : null,
    category ? { label: "Categoría", value: category } : null,
    materialWork ? { label: "Material a maquinar", value: materialWork } : null,
    diameter != null ? { label: "Ø de corte", value: `${diameter} mm` } : null,
    flutes != null ? { label: "N° de filos", value: String(flutes) } : null,
    coating ? { label: "Recubrimiento", value: coating } : null,
    material ? { label: "Material", value: material } : null,
    iso ? { label: "Designación ISO", value: iso } : null,
    disponibilidad ? { label: "Disponibilidad", value: disponibilidad } : null,
  ];
  // 2 columnas × 3 filas máx.: hasta 6 datos, priorizando los de arriba.
  const infos: Info[] = candidates
    .filter((x): x is Info => x !== null)
    .slice(0, 6);

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
        {/* Izquierda: portada del producto (contain) + SKU superpuesto. */}
        <div
          style={{
            display: "flex",
            position: "relative",
            flexShrink: 0,
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
          {sku ? (
            <div
              style={{
                position: "absolute",
                bottom: 18,
                left: 18,
                display: "flex",
                alignItems: "center",
                background: "rgba(14,62,96,0.9)",
                border: "1px solid rgba(255,255,255,0.16)",
                color: "#ffffff",
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: 0.5,
                padding: "8px 14px",
                borderRadius: 10,
              }}
            >
              {`SKU ${sku}`}
            </div>
          ) : null}
        </div>

        {/* Derecha: logo + nombre + N° de parte + datos clave. */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flexGrow: 1,
            height: "100%",
            paddingLeft: 48,
          }}
        >
          {/* Logo HERCAN en chip blanco (arriba, al ras izquierdo). */}
          <div style={{ display: "flex" }}>
            <div
              style={{
                display: "flex",
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
          </div>

          {/* Nombre del producto + barra de acento + N° de parte prominente. */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                width: 110,
                height: 10,
                borderRadius: 5,
                background:
                  "linear-gradient(90deg, #0e3e60 0%, #2083a3 50%, #5e9cc1 100%)",
                marginBottom: 20,
              }}
            />
            <div
              style={{
                display: "flex",
                fontSize: nameFontSize(name),
                fontWeight: 800,
                lineHeight: 1.08,
                letterSpacing: -0.5,
                maxWidth: 560,
              }}
            >
              {name}
            </div>
            {partNo ? (
              <div
                style={{ display: "flex", flexDirection: "column", marginTop: 20 }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: 15,
                    fontWeight: 600,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    color: "#5e9cc1",
                  }}
                >
                  N° de parte
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: 34,
                    fontWeight: 800,
                    color: "#ffffff",
                    marginTop: 4,
                  }}
                >
                  {partNo}
                </div>
              </div>
            ) : null}
          </div>

          {/* Datos clave B2B (2 columnas) + dominio. */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {infos.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  width: "100%",
                  gap: "16px 40px",
                }}
              >
                {infos.map((info) => (
                  <div
                    key={info.label}
                    style={{ display: "flex", flexDirection: "column", width: 250 }}
                  >
                    <div
                      style={{
                        display: "flex",
                        fontSize: 14,
                        fontWeight: 600,
                        letterSpacing: 1.5,
                        textTransform: "uppercase",
                        color: "#8aa6bd",
                      }}
                    >
                      {info.label}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        fontSize: 23,
                        fontWeight: 700,
                        color: "#ffffff",
                        marginTop: 3,
                      }}
                    >
                      {info.value}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
            <div
              style={{
                display: "flex",
                fontSize: 22,
                fontWeight: 600,
                color: "#5e9cc1",
                marginTop: 24,
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
