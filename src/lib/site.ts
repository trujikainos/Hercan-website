/**
 * FUENTE ÚNICA DE VERDAD del sitio Hercan.
 * De aquí se derivan: metadata, JSON-LD (@graph), sitemap, robots, llms.txt, OG, footer.
 * Cambiar algo aquí lo propaga a todos lados → cero desincronización.
 *
 * Los TODO son datos por confirmar con el cliente (Armando) antes de producción.
 */

export const site = {
  // Dominio final (se fija con NEXT_PUBLIC_SITE_URL en Vercel al elegir dominio)
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://hercan.com.mx", // TODO: confirmar dominio final

  name: "HERCAN",
  legalName: "Herramientas de Carburo de Tungsteno del Norte, S.A. de C.V.",
  // Variantes de marca (para Organization.alternateName en schema)
  alternateNames: ["Hercan", "Herramientas de Carburo de Tungsteno del Norte"],

  tagline: "Herramentales para CNC y equipos de medición",
  description:
    "Herramientas de corte de carburo de tungsteno y equipos de medición para CNC. Distribuidor B2B industrial en México: Iscar, Toolmex, YG, Palbit, Mitutoyo y más, con especificaciones técnicas filtrables.",

  locale: "es_MX",
  lang: "es-MX",
  currency: "USD",
  country: "MX",

  // Marcas que distribuye Hercan (barra de confianza + páginas de marca).
  // Iscar es la marca ancla (alto valor SEO, sin distribuidor mexicano posicionado).
  // `logo`: ruta a un archivo oficial en /public/brand/logos/ (vacío = se muestra el nombre).
  brands: [
    { name: "Iscar", logo: "" },
    { name: "Toolmex", logo: "" },
    { name: "YG", logo: "" },
    { name: "Palbit", logo: "" },
    { name: "Mitutoyo", logo: "" },
  ] as { name: string; logo: string }[],

  // Contacto / NAP — debe coincidir con el Google Business Profile
  email: "ventas@hercan.com.mx", // TODO: confirmar correo comercial
  phone: "", // TODO: teléfono comercial (formato +52…)
  whatsapp: "528442864095", // WhatsApp de ventas (dígitos con lada país)
  address: {
    // Tomado de la ubicación de inventario en Shopify; confirmar dirección comercial pública
    street: "Av. Plan de Ayala 1208", // TODO: confirmar
    city: "Monterrey",
    state: "Nuevo León",
    postalCode: "", // TODO
    country: "MX",
  },
  geo: { lat: null as number | null, lng: null as number | null }, // TODO: coordenadas

  // Redes sociales (Organization.sameAs)
  sameAs: [] as string[], // TODO: URLs de Facebook, LinkedIn, etc.

  // IDs de tracking (Fase 6) — vacíos hasta crear las cuentas
  ga4: process.env.NEXT_PUBLIC_GA4_ID || "", // TODO: G-XXXXXXX
  clarity: process.env.NEXT_PUBLIC_CLARITY_ID || "", // TODO
  metaPixel: process.env.NEXT_PUBLIC_META_PIXEL_ID || "", // TODO

  ogImage: "/brand/hercan-logo.jpg", // TODO: OG dedicada 1200x630 (Fase OG con next/og)
} as const;

export const absoluteUrl = (path = "/") =>
  new URL(path, site.url).toString();
