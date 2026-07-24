import type { NextConfig } from "next";

// Cabeceras de seguridad aplicadas a todas las respuestas. Cierran clickjacking
// (X-Frame-Options), sniffing de MIME, fuga de referer, y fuerzan HTTPS (HSTS).
// No se incluye una Content-Security-Policy con `script-src` estricta aquí porque
// Next inyecta scripts inline sin nonce; una CSP completa requiere middleware con
// nonce y se deja como mejora aparte. `frame-ancestors 'none'` cubre el iframe.
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // `isomorphic-dompurify`/`jsdom` NO deben bundlearse en las funciones serverless:
  // jsdom lee archivos relativos a su ruta en node_modules (entities, etc.) al
  // inicializar, y al empaquetarlo esas rutas se rompen → la función crashea al
  // arrancar (FUNCTION_INVOCATION_FAILED). Como sanitize.ts se importa vía shopify.ts
  // en el layout, rompía TODAS las páginas en Vercel. Externalizarlas lo resuelve.
  serverExternalPackages: ["isomorphic-dompurify", "jsdom"],
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
