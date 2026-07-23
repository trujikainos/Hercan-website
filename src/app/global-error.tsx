"use client";

// Último recurso: se activa solo si el propio ROOT LAYOUT falla (reemplaza <html>).
// No puede usar el layout ni los estilos del sitio, así que va con estilos inline
// mínimos, pero con la marca. Cubre el peor caso para que nunca haya un crash crudo.
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es-MX">
      <body
        style={{
          fontFamily: "system-ui, -apple-system, Arial, sans-serif",
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          color: "#23272b",
        }}
      >
        <div style={{ maxWidth: 460, padding: 24, textAlign: "center" }}>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: 1,
              textTransform: "uppercase",
              color: "#2083a3",
            }}
          >
            HERCAN
          </p>
          <h1 style={{ color: "#0e3e60", fontSize: 26, margin: "8px 0 0" }}>
            Algo salió mal
          </h1>
          <p style={{ color: "#6e7175", lineHeight: 1.6, marginTop: 12 }}>
            Tuvimos un problema al cargar el sitio. Intenta de nuevo en un momento.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 20,
              background: "#0e3e60",
              color: "#fff",
              border: 0,
              borderRadius: 8,
              padding: "10px 22px",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
