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
  phone: "", // TODO: teléfono comercial (formato +52…) — no viene en la constancia
  whatsapp: "528442864095", // WhatsApp de ventas (dígitos con lada país)
  // Datos fiscales de la constancia SAT (jul-2026).
  rfc: "HCT130408CK5",
  // Razón social EXACTA del SAT (difiere del branding "Tungsteno del Norte"):
  legalNameSat: "Herramientas de Carburo de Tugsteno del Noreste, S.A. de C.V.",
  address: {
    // Domicilio FISCAL (constancia SAT). TODO: confirmar si es también el domicilio
    // comercial público (el de Shopify era "Av. Plan de Ayala 1208" — distinto).
    street: "Calle Magnolia 1781, Col. Reforma",
    city: "Monterrey",
    state: "Nuevo León",
    postalCode: "64550",
    country: "MX",
  },
  geo: { lat: null as number | null, lng: null as number | null }, // TODO: coordenadas

  // Sucursales físicas (para /contacto y mapas). Monterrey = domicilio fiscal (constancia).
  // Saltillo: la lada 844 del WhatsApp confirma tienda ahí, pero falta la dirección exacta.
  // Coordenadas aprox. de ciudad (el iframe de Maps geocodifica por dirección; refinar).
  locations: [
    {
      name: "Monterrey",
      street: "Calle Magnolia 1781, Col. Reforma", // domicilio fiscal; confirmar si es el público
      city: "Monterrey",
      state: "Nuevo León",
      postalCode: "64550",
      lat: 25.6866,
      lng: -100.3161,
      isFiscal: true,
    },
    {
      name: "Saltillo",
      street: "", // TODO: dirección de la tienda de Saltillo
      city: "Saltillo",
      state: "Coahuila",
      postalCode: "",
      lat: 25.4383,
      lng: -100.9737,
      isFiscal: false,
    },
  ],

  // Redes sociales (Organization.sameAs)
  sameAs: [] as string[], // TODO: URLs de Facebook, LinkedIn, etc.

  // IDs de tracking (Fase 6) — vacíos hasta crear las cuentas
  ga4: process.env.NEXT_PUBLIC_GA4_ID || "", // TODO: G-XXXXXXX
  clarity: process.env.NEXT_PUBLIC_CLARITY_ID || "", // TODO
  metaPixel: process.env.NEXT_PUBLIC_META_PIXEL_ID || "", // TODO

  // Logo de la marca para JSON-LD (Organization/LocalBusiness `logo`/`image` en schema.ts).
  // La og:image de redes NO sale de aquí: la generan los archivos `opengraph-image.tsx`
  // (next/og, 1200×630) — la convención de archivo gana por ruta, sin duplicar og:image.
  ogImage: "/brand/hercan-logo.jpg",
} as const;

export const absoluteUrl = (path = "/") =>
  new URL(path, site.url).toString();
