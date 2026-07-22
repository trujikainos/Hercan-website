import type { Metadata, Viewport } from "next";
import { Oswald, Inter } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";
import { getCart } from "@/lib/shopify-cart";
import { isShopifyConnected } from "@/lib/shopify";
import { CartProvider } from "@/components/cart/cart-provider";
import { RevealController } from "@/components/reveal-controller";
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
  // NEXT_PUBLIC_NOINDEX=1 (staging) → noindex; producción → indexable.
  robots:
    process.env.NEXT_PUBLIC_NOINDEX === "1"
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-snippet": -1,
            "max-image-preview": "large",
            "max-video-preview": -1,
          },
        },
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
      <body className="min-h-full flex flex-col bg-white">
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[100] focus:rounded focus:bg-hc-navy focus:px-3 focus:py-2 focus:text-white"
        >
          Saltar al contenido
        </a>
        <RevealController />
        <CartProvider initialCart={initialCart} enabled={isShopifyConnected}>
          {children}
        </CartProvider>
        <WhatsAppFloat />
      </body>
    </html>
  );
}
