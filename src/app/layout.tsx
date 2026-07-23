import type { Metadata, Viewport } from "next";
import { Oswald, Inter } from "next/font/google";
import "./globals.css";
import { site, INDEXABLE } from "@/lib/site";
import { getCart } from "@/lib/shopify-cart";
import { isShopifyConnected } from "@/lib/shopify";
import { CartProvider } from "@/components/cart/cart-provider";
import { WhatsAppFloat } from "@/components/whatsapp-float";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["500", "600"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    locale: site.locale,
    url: site.url,
    siteName: site.name,
  },
  twitter: { card: "summary_large_image" },
  // Fail-closed: indexable SÓLO con NEXT_PUBLIC_ALLOW_INDEX=1 (dominio real en vivo).
  // Por default —staging, preview, local— noindex. Ver `INDEXABLE` en lib/site.
  robots: INDEXABLE
    ? {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-snippet": -1,
          "max-image-preview": "large",
          "max-video-preview": -1,
        },
      }
    : { index: false, follow: false },
  icons: { icon: "/brand/hercan-favicon.png" },
};

export const viewport: Viewport = {
  themeColor: "#0e3e60",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let initialCart = null;
  try {
    initialCart = await getCart(); // lee cookies → layout dinámico (badge por visitante)
  } catch {
    // Nunca romper el render por un fallo transitorio de la Storefront API;
    // el badge se poblará en la siguiente carga o acción del carrito.
  }
  return (
    <html
      lang="es-MX"
      suppressHydrationWarning
      className={`${oswald.variable} ${inter.variable} h-full antialiased`}
    >
      {/* suppressHydrationWarning: extensiones del navegador (ColorZilla,
          Grammarly…) inyectan atributos en <body> antes de hidratar (p. ej.
          cz-shortcut-listen); sin esto React reporta un hydration mismatch. */}
      <body className="min-h-full flex flex-col bg-white" suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            // Marca que hay JS → activa el reveal por CSS (`.js .reveal`, ver
            // globals.css). Es lo único necesario: el reveal es 100% CSS (animación
            // de entrada), sin observers ni manipulación del DOM, así que no causa
            // hydration mismatch ni pantallas en blanco.
            __html: "document.documentElement.classList.add('js')",
          }}
        />
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[100] focus:rounded focus:bg-hc-navy focus:px-3 focus:py-2 focus:text-white"
        >
          Saltar al contenido
        </a>
        <CartProvider initialCart={initialCart} enabled={isShopifyConnected}>
          {children}
        </CartProvider>
        <WhatsAppFloat />
      </body>
    </html>
  );
}
