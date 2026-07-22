import { ImageResponse } from "next/og";

export const alt = "HERCAN — Herramientas de corte para CNC y equipos de medición";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// OG de marca por defecto (home y páginas sin OG propia). 1200x630.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0e3e60 0%, #082a43 60%, #061f31 100%)",
          color: "#ffffff",
          padding: "84px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "22px" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 14,
              background: "#c0c0c2",
              color: "#0e3e60",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 44,
              fontWeight: 800,
            }}
          >
            H
          </div>
          <div style={{ fontSize: 52, fontWeight: 800, letterSpacing: 2 }}>HERCAN</div>
        </div>

        <div style={{ display: "flex", height: 8, width: 120, background: "#2083a3", borderRadius: 4, marginTop: 40 }} />

        <div style={{ fontSize: 62, fontWeight: 800, lineHeight: 1.05, marginTop: 28, maxWidth: 940 }}>
          Herramientas de corte para CNC y equipos de medición
        </div>
        <div style={{ fontSize: 30, color: "#5e9cc1", marginTop: 28 }}>
          Iscar · Toolmex · YG · Palbit · Mitutoyo — Distribuidor B2B en México
        </div>
      </div>
    ),
    { ...size },
  );
}
