"use client";

import type { ChangeEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  LISTING_PAGE_LIMITS,
  parseListingLimit,
  type ListingPageLimit,
} from "@/lib/listings-query";

export function ListingsLimitSelect() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const isListingsHome = pathname === "/" || pathname === "/admin";
  if (!isListingsHome) {
    return (
      <div
        className="hidden min-w-0 flex-1 md:block md:max-w-lg lg:max-w-xl"
        aria-hidden
      />
    );
  }

  const limit = parseListingLimit(searchParams.get("limit"));

  const onChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const nextLimit = Number(e.target.value) as ListingPageLimit;
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", String(nextLimit));
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="hidden min-w-0 flex-1 items-center md:flex md:max-w-lg lg:max-w-xl">
      <label htmlFor="listings-limit" className="sr-only">
        Listings per page
      </label>
      <select
        id="listings-limit"
        value={limit}
        onChange={onChange}
        className="max-w-[11rem] cursor-pointer rounded-full border border-outline-variant/40 bg-surface-container px-4 py-2 text-sm font-medium text-on-surface shadow-sm transition-colors hover:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        {LISTING_PAGE_LIMITS.map((n) => (
          <option key={n} value={n}>
            {n} per page
          </option>
        ))}
      </select>
    </div>
  );
}
