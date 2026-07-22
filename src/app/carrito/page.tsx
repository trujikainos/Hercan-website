import { AnnouncementBar, SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/home-sections";
import { CartPageContents } from "@/components/cart/cart-page-contents";

export const metadata = {
  title: "Carrito",
  robots: { index: false, follow: true },
};

export default function CarritoPage() {
  return (
    <>
      <AnnouncementBar />
      <SiteHeader />
      <main id="contenido" className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
        <h1 className="reveal mb-6 font-heading text-2xl text-hc-navy">Carrito</h1>
        <CartPageContents />
      </main>
      <SiteFooter />
    </>
  );
}
