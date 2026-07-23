import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// Bots de IA permitidos explícitamente (GEO/citabilidad): si no te pueden leer,
// no te pueden citar. Se listan aparte porque en robots.txt los grupos por
// user-agent NO son aditivos con el grupo "*": cada bot con regla propia necesita
// su propio Disallow, por eso reciben la misma lista privada abajo.
const AI_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
];

// Superficies que ningún bot debe rastrear: carrito (privado por visitante) y las
// rutas internas de API (búsqueda, OAuth de Shopify). `/*?*ver=` corta el
// acumulador de paginación "Mostrar más" (duplicados infinitos de la misma
// colección, sin contenido único) → ahorra presupuesto de rastreo en el catálogo.
const DISALLOW = ["/carrito", "/api/", "/*?*ver="];

export default function robots(): MetadataRoute.Robots {
  // Staging (NEXT_PUBLIC_NOINDEX=1): bloquea TODO para que ni Google ni los bots
  // de IA indexen el sitio con datos placeholder. Coherente con el <meta robots>
  // noindex global del layout. NO referimos sitemap/host aquí a propósito.
  if (process.env.NEXT_PUBLIC_NOINDEX === "1") {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  // Producción: rastreo abierto salvo las superficies privadas; bots de IA
  // bienvenidos (con el mismo Disallow para no rastrear carrito/API).
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      ...AI_BOTS.map((userAgent) => ({ userAgent, allow: "/", disallow: DISALLOW })),
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
