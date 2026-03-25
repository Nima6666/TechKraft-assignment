"use client";

import Link from "next/link";
import type { PropertyListing } from "@/lib/properties";
import { formatPriceUSD } from "@/lib/properties";
import { HighlightIcon } from "@/components/icons/highlight-icon";
import { LocationIcon } from "@/components/icons/location-icon";
import { PropertyTypeIcon } from "@/components/icons/property-type-icon";
import { useIsAdmin } from "@/context/admin-mode-context";

export function PropertyCard({ listing }: { listing: PropertyListing }) {
  const isAdmin = useIsAdmin();
  const detailHref = isAdmin ? `/admin/${listing.id}` : `/${listing.id}`;
  const notesPreview =
    listing.internalNotes != null &&
    String(listing.internalNotes).trim() !== ""
      ? listing.internalNotes
      : null;

  return (
    <Link
      href={detailHref}
      className="group block overflow-hidden rounded-xl border border-outline-variant/50 bg-surface-container-lowest shadow-[0px_12px_32px_rgba(25,28,29,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0px_16px_40px_rgba(25,28,29,0.1)]"
    >
      <div className="flex h-full flex-col p-8">
        <div className="mb-5 flex items-center gap-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/[0.08] group-hover:bg-primary/[0.12]"
            aria-hidden
          >
            <PropertyTypeIcon type={listing.type} />
          </div>
          <div className="min-w-0 flex-1">
            <span className="inline-block rounded-full bg-primary-container px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-on-primary-container">
              {listing.type}
            </span>
          </div>
        </div>

        <div className="flex-1">
          <h3 className="font-headline mb-1 text-xl font-bold leading-snug text-on-surface sm:text-2xl">
            {listing.title}
          </h3>
          <p className="mb-4 flex items-start gap-1.5 text-sm leading-snug text-on-surface-variant">
            <LocationIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{listing.location}</span>
          </p>
          <span className="font-headline text-2xl font-bold text-primary">
            {formatPriceUSD(listing.price)}
          </span>
        </div>

        <div className="mt-6 border-t border-outline-variant/50 pt-5">
          <ul className="flex flex-wrap gap-2" aria-label="Property highlights">
            {listing.highlights.map((h) => (
              <li
                key={h.label}
                className="inline-flex items-center gap-1.5 rounded-full bg-surface-container px-3 py-1.5 text-on-surface-variant"
              >
                <HighlightIcon name={h.icon} />
                <span className="text-xs font-medium tabular-nums text-on-surface">{h.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {isAdmin ? (
          <div className="mt-4 rounded-lg border border-amber-200/90 bg-amber-50/60 px-3 py-2.5 text-left">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-amber-900/90">
              Internal notes
            </p>
            <p className="line-clamp-4 whitespace-pre-wrap text-xs leading-snug text-amber-950/85">
              {notesPreview ?? "—"}
            </p>
          </div>
        ) : null}
      </div>
    </Link>
  );
}
