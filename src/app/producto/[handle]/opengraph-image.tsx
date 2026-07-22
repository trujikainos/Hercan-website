import { ImageResponse } from "next/og";
import { getProductByHandle } from "@/lib/shopify";

export const alt = "Producto — HERCAN";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// OG dinámica por producto: marca + título + N° de parte. 1200x630.
export default async function ProductOG({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const p = await getProductByHandle(handle);
  const title = (p?.title ?? "Producto").replace(/\s*\[[^\]]+\]\s*$/, "").trim();
  const partNo = p?.mpn ?? p?.sku ?? "";
  const brand = p?.brand ?? "";
  const category = p?.category ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0e3e60 0%, #082a43 60%, #061f31 100%)",
          color: "#ffffff",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 11,
                background: "#c0c0c2",
                color: "#0e3e60",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                fontWeight: 800,
              }}
            >
              H
            </div>
            <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: 1 }}>HERCAN</div>
          </div>
          {brand ? (
            <div style={{ fontSize: 26, color: "#5e9cc1", fontWeight: 600 }}>{brand}</div>
          ) : (
            <div style={{ display: "flex" }} />
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {category ? (
            <div style={{ fontSize: 24, color: "#5e9cc1", marginBottom: 14, textTransform: "uppercase", letterSpacing: 2 }}>
              {category}
            </div>
          ) : (
            <div style={{ display: "flex" }} />
          )}
          <div style={{ fontSize: 58, fontWeight: 800, lineHeight: 1.08, maxWidth: 1050 }}>
            {title}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", height: 8, width: 90, background: "#2083a3", borderRadius: 4 }} />
          {partNo ? (
            <div style={{ fontSize: 28, color: "#c0c0c2" }}>{`N° de parte: ${partNo}`}</div>
          ) : (
            <div style={{ display: "flex" }} />
          )}
        </div>
      </div>
    ),
    { ...size },
  );
}
