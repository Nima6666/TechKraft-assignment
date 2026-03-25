import { SiteHeader } from "@/components/site-header";
import { ListingDetailView } from "@/components/listing-detail-view";

export default function AdminListingDetailPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <ListingDetailView />
    </div>
  );
}
