import { ImageResponse } from "next/og";
import { getArticleByHandle } from "@/lib/shopify";
import {
  renderBrandOG,
  getBrandLogoDataUrl,
  fetchRemoteImageDataUrl,
  OG_SIZE,
  BRAND_DOMAIN,
} from "@/lib/og";

export const alt = "Artículo — HERCAN";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// On-demand: no pre-generar la OG de cada artículo en build.
export const dynamic = "force-dynamic";

/** Tamaño de fuente del título del artículo para la columna derecha. */
function titleFontSize(t: string): number {
  const n = t.length;
  if (n > 84) return 38;
  if (n > 58) return 44;
  if (n > 36) return 52;
  return 58;
}

// OG por artículo. Con portada del artículo → tarjeta de dos columnas (foto a la
// izquierda + logo/eyebrow/título/fecha a la derecha). Sin portada o si el fetch
// falla → template de marca (renderBrandOG) con el título real del artículo.
export default async function Image({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  // El fetch a Shopify puede lanzar (red / GraphQL / handle inexistente): una OG
  // nunca debe devolver 500, así que cualquier fallo cae al template de marca.
  let a: Awaited<ReturnType<typeof getArticleByHandle>> = null;
  try {
    a = await getArticleByHandle(handle);
  } catch {
    a = null;
  }
  const title = a?.title ?? "Blog HERCAN";
  const cover = a?.image ? await fetchRemoteImageDataUrl(a.image) : null;

  // ── Fallback de marca (sin portada o fetch fallido) ──────────────────────
  if (!cover) {
    return renderBrandOG({ eyebrow: "Blog", title });
  }

  // ── Tarjeta con portada del artículo ─────────────────────────────────────
  const logoSrc = await getBrandLogoDataUrl();
  const name = title.length > 108 ? `${title.slice(0, 107).trimEnd()}…` : title;
  const date = a?.publishedAt
    ? new Date(a.publishedAt).toLocaleDateString("es-MX", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";
  const meta = [date, a?.author].filter(Boolean).join("  ·  ");

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
        {/* Izquierda: portada del artículo (cover). */}
        <div
          style={{
            display: "flex",
            flexShrink: 0,
            alignItems: "center",
            justifyContent: "center",
            width: 470,
            height: "100%",
            background: "#ffffff",
            borderRadius: 24,
            padding: 20,
            boxShadow: "0 12px 34px rgba(0,0,0,0.30)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover}
            width={430}
            height={478}
            alt={name}
            style={{ objectFit: "cover", borderRadius: 12 }}
          />
        </div>

        {/* Derecha: logo + eyebrow "Blog" + título + fecha/autor. */}
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

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontSize: 24,
                fontWeight: 600,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: "#5e9cc1",
                marginBottom: 18,
              }}
            >
              Blog
            </div>
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
                fontSize: titleFontSize(name),
                fontWeight: 800,
                lineHeight: 1.08,
                letterSpacing: -0.5,
                maxWidth: 560,
              }}
            >
              {name}
            </div>
          </div>

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
                fontSize: 22,
                fontWeight: 600,
                color: "#5e9cc1",
              }}
            >
              {BRAND_DOMAIN}
            </div>
            {meta ? (
              <div style={{ display: "flex", fontSize: 22, color: "#a9bccb" }}>
                {meta}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
