"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useIsAdmin } from "@/context/admin-mode-context";
import { usePropertyDetail } from "@/hooks/use-property-detail";
import { HighlightIcon } from "@/components/icons/highlight-icon";
import { HomeIcon } from "@/components/icons/home-icon";
import { LandIcon } from "@/components/icons/land-icon";
import { LocationIcon } from "@/components/icons/location-icon";
import { PaginationArrowIcon } from "@/components/icons/pagination-arrow-icon";
import { formatPriceUSD } from "@/lib/properties";

export function ListingDetailView() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : undefined;
  const isAdmin = useIsAdmin();
  const { listing, loading, error, notFound, refetch } = usePropertyDetail(id);
  const listingsHref = isAdmin ? "/admin" : "/";

  return (
    <main className="flex-1 px-6 pb-16 pt-24 md:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href={listingsHref}
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <PaginationArrowIcon
            direction="backward"
            className="h-5 w-5 shrink-0"
          />
          Back to listings
        </Link>

        {loading && (
          <div
            className="rounded-xl border border-outline-variant/50 bg-surface-container-lowest p-8 shadow-sm md:p-10"
            aria-busy
            aria-label="Loading listing"
          >
            <div className="animate-pulse space-y-6">
              <div className="flex gap-4">
                <div className="h-20 w-20 rounded-2xl bg-surface-container-high" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-24 rounded-full bg-surface-container-high" />
                  <div className="h-9 w-3/4 rounded bg-surface-container-high" />
                  <div className="h-4 w-1/2 rounded bg-surface-container-high" />
                </div>
              </div>
              <div className="h-32 rounded-lg bg-surface-container-high" />
            </div>
          </div>
        )}

        {error && (
          <div
            className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900"
            role="alert"
          >
            <p className="font-medium text-red-800">{error}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-2 font-semibold text-primary underline"
            >
              Try again
            </button>
          </div>
        )}

        {notFound && !loading && (
          <div className="rounded-xl border border-outline-variant/50 bg-surface-container-lowest p-8 text-center shadow-sm md:p-10">
            <h1 className="font-headline text-xl font-bold text-on-surface">
              Property not found
            </h1>
            <p className="mt-2 text-sm text-on-surface-variant">
              This listing may have been removed or the link is invalid.
            </p>
            <Link
              href={listingsHref}
              className="mt-6 inline-block text-sm font-semibold text-primary underline"
            >
              Back to listings
            </Link>
          </div>
        )}

        {listing && !loading && (
          <div className="rounded-xl border border-outline-variant/50 bg-surface-container-lowest p-8 shadow-sm md:p-10">
            <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-primary/[0.06] p-4" aria-hidden>
                  {listing.type === "LAND" ? (
                    <LandIcon className="h-12 w-12 shrink-0 text-primary" />
                  ) : (
                    <HomeIcon className="h-12 w-12 shrink-0 text-primary" />
                  )}
                </div>
                <div>
                  <span className="mb-2 inline-block rounded-full bg-primary-container px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-on-primary-container">
                    {listing.type}
                  </span>
                  <h1 className="font-headline text-3xl font-extrabold text-on-surface md:text-4xl">
                    {listing.title}
                  </h1>
                  <p className="mt-2 flex items-center gap-1 text-on-surface-variant">
                    <LocationIcon className="h-3.5 w-3.5 shrink-0" />
                    {listing.location}
                  </p>
                </div>
              </div>
              <p className="font-headline text-3xl font-bold text-primary">
                {formatPriceUSD(listing.price)}
              </p>
            </div>

            {(listing.rooms != null || listing.sqft != null) && (
              <ul className="mb-8 flex flex-wrap gap-6 border-y border-outline-variant/50 py-6">
                {listing.rooms != null && (
                  <li className="flex items-center gap-2 text-on-surface-variant">
                    <HighlightIcon
                      name="meeting_room"
                      svgClassName="h-5 w-5 shrink-0"
                      symbolClassName="material-symbols-outlined shrink-0"
                    />
                    <span className="font-medium text-on-surface">
                      {listing.rooms} rooms
                    </span>
                  </li>
                )}
                {listing.sqft != null && (
                  <li className="flex items-center gap-2 text-on-surface-variant">
                    <span className="h-5 w-5 shrink-0" aria-hidden />
                    <span className="font-medium text-on-surface">
                      {listing.sqft.toLocaleString()} sqft
                    </span>
                  </li>
                )}
              </ul>
            )}

            <div className="mb-8 flex flex-wrap gap-3">
              {listing.highlights.map((h) => (
                <span
                  key={h.label}
                  className="inline-flex items-center gap-1.5 rounded-full bg-surface-container px-3 py-1.5 text-xs font-medium text-on-surface-variant"
                >
                  <HighlightIcon
                    name={h.icon}
                    svgClassName="h-4 w-4 shrink-0"
                    symbolClassName="material-symbols-outlined text-base shrink-0"
                  />
                  {h.label}
                </span>
              ))}
            </div>

            <h2 className="font-headline mb-3 text-lg font-bold text-on-surface">
              About this property
            </h2>
            <p className="leading-relaxed text-on-surface-variant">
              {listing.description}
            </p>

            {isAdmin && (
              <section
                className="mt-8 rounded-xl border border-amber-200/90 bg-amber-50/60 px-4 py-5 md:px-5"
                aria-label="Internal notes"
              >
                <h2 className="font-headline mb-2 text-sm font-bold uppercase tracking-wide text-amber-900/90">
                  Internal notes
                </h2>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-amber-950/85">
                  {listing.internalNotes != null &&
                  String(listing.internalNotes).trim() !== ""
                    ? listing.internalNotes
                    : "—"}
                </p>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
