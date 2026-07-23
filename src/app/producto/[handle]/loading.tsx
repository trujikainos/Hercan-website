import { AnnouncementBar, SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/home-sections";
import { ProductSkeleton } from "@/components/skeletons";

// Fallback instantáneo mientras la ficha (server, con fetch a Shopify) carga.
// Aparece al navegar desde el buscador, el catálogo o las taxonomías.
export default function Loading() {
  return (
    <>
      <AnnouncementBar />
      <SiteHeader />
      <ProductSkeleton />
      <SiteFooter />
    </>
  );
}
