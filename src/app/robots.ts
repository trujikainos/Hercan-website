import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// Bots de IA permitidos explícitamente (si no te pueden leer, no te pueden citar).
const AI_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
];

export default function robots(): MetadataRoute.Robots {
  // Staging: bloquea TODO para que Google no indexe el sitio con datos placeholder.
  if (process.env.NEXT_PUBLIC_NOINDEX === "1") {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/carrito"] },
      ...AI_BOTS.map((userAgent) => ({ userAgent, allow: "/" })),
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
