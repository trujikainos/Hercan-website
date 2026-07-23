import { AnnouncementBar, SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/home-sections";
import { CatalogSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <>
      <AnnouncementBar />
      <SiteHeader />
      <CatalogSkeleton />
      <SiteFooter />
    </>
  );
}
