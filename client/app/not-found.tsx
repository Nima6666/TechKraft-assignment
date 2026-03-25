import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-24 pt-28">
        <h1 className="font-headline text-2xl font-bold text-on-surface">Listing not found</h1>
        <p className="mt-2 text-center text-on-surface-variant">
          This property may have been removed or the link is invalid.
        </p>
        <Link href="/" className="mt-6 font-medium text-primary underline">
          Return to listings
        </Link>
      </main>
    </div>
  );
}
