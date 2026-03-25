import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { ListingsView } from "@/components/listings-view";

export default function AdminHomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Suspense
        fallback={
          <div className="flex min-h-screen flex-col bg-background pt-20">
            <div className="fixed top-0 z-50 w-full border-b border-outline-variant/50 bg-white/85 px-5 py-3.5 sm:px-8">
              <div className="mx-auto h-9 max-w-screen-2xl animate-pulse rounded bg-surface-container sm:h-10" />
            </div>
            <div className="px-6 py-8 md:px-10 md:py-12 lg:px-12">
              <div className="mx-auto grid max-w-screen-xl grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-64 animate-pulse rounded-xl bg-surface-container-low"
                  />
                ))}
              </div>
            </div>
          </div>
        }
      >
        <>
          <SiteHeader />
          <ListingsView />
        </>
      </Suspense>
    </div>
  );
}
