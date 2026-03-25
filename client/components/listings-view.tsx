"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { usePropertiesList } from "@/hooks/use-properties-list";
import { ListingsFilters } from "@/components/listings-filters";
import { PaginationArrowIcon } from "@/components/icons/pagination-arrow-icon";
import { parsePropertiesListParams } from "@/lib/listings-query";
import type { PropertyType } from "@/lib/properties";
import { PropertyCard } from "./property-card";

export function ListingsView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const listParams = useMemo(
    () => parsePropertiesListParams(searchParams),
    [searchParams]
  );

  const page = listParams.page;
  const limit = listParams.limit;

  const { data, pagination, loading, error, refetch } =
    usePropertiesList(listParams);

  const mergeQuery = useCallback(
    (updates: Record<string, string | undefined>, resetPage = true) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (v === undefined || v === "") params.delete(k);
        else params.set(k, v);
      }
      if (resetPage) params.set("page", "1");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const setPage = (next: number) => {
    const p = Math.max(1, next);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    params.set("limit", String(limit));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const totalPages = useMemo(() => {
    if (!pagination) return 1;
    const lp = pagination.limit > 0 ? pagination.limit : limit;
    return Math.max(1, Math.ceil(pagination.total / lp));
  }, [pagination, limit]);

  const propertyTypeParam = searchParams.get("propertyType")?.toUpperCase();
  const propertyTypeUrl: PropertyType | "" =
    propertyTypeParam === "HOUSE" || propertyTypeParam === "LAND"
      ? propertyTypeParam
      : "";

  return (
    <div className="flex w-full min-w-0 flex-1 flex-col bg-background pt-20 md:flex-row">
      <aside className="sticky top-20 z-10 w-full shrink-0 border-b border-outline-variant/40 bg-[#f8f9fa] md:h-fit md:max-h-none md:w-72 md:border-b-0 md:border-r lg:w-80">
        <div className="flex flex-col gap-4 p-6 md:p-8">
          <div className="mb-0">
            <h2 className="font-headline text-xl font-bold text-primary">Filters</h2>
            <p className="text-xs font-semibold text-on-surface-variant">
              Refine your search
            </p>
          </div>
          <ListingsFilters
            suburbUrl={searchParams.get("suburb") ?? ""}
            cityUrl={searchParams.get("city") ?? ""}
            propertyTypeUrl={propertyTypeUrl}
            priceMinUrl={searchParams.get("priceMin") ?? ""}
            priceMaxUrl={searchParams.get("priceMax") ?? ""}
            roomsMinUrl={searchParams.get("roomsMin") ?? ""}
            roomsMaxUrl={searchParams.get("roomsMax") ?? ""}
            floorAreaMinUrl={searchParams.get("floorAreaMin") ?? ""}
            floorAreaMaxUrl={searchParams.get("floorAreaMax") ?? ""}
            lotSqftMinUrl={searchParams.get("lotSqftMin") ?? ""}
            lotSqftMaxUrl={searchParams.get("lotSqftMax") ?? ""}
            sortUrl={listParams.sort}
            mergeQuery={mergeQuery}
          />
        </div>
      </aside>

      <main className="min-w-0 flex-1 bg-background px-6 py-8 md:px-10 md:py-12 lg:px-12">
        <div className="mx-auto max-w-screen-xl">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="font-headline mb-2 text-3xl font-extrabold tracking-tight text-primary md:text-4xl">
                Available Properties
              </h1>
              <p className="text-on-surface-variant">
                {pagination ? (
                  <>
                    Showing {data.length} on this page · {pagination.total} total
                    {totalPages > 1
                      ? ` · Page ${pagination.currentpage} of ${totalPages}`
                      : ""}
                  </>
                ) : loading ? (
                  "Loading…"
                ) : (
                  "No results"
                )}
              </p>
            </div>
          </div>

          {error && (
            <div
              className="mb-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900"
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

          {loading && !data.length ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-xl border border-outline-variant/40 bg-surface-container-low p-8"
                >
                  <div className="mb-6 flex justify-between">
                    <div className="h-16 w-16 rounded-2xl bg-surface-container-high" />
                    <div className="h-6 w-20 rounded-full bg-surface-container-high" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-8 w-3/4 rounded bg-surface-container-high" />
                    <div className="h-4 w-1/2 rounded bg-surface-container-high" />
                    <div className="h-8 w-1/3 rounded bg-surface-container-high" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                {data.map((listing) => (
                  <PropertyCard key={listing.id} listing={listing} />
                ))}
              </div>

              {!data.length && !loading && !error && (
                <p className="mt-12 text-center text-on-surface-variant">
                  No properties found.
                </p>
              )}

              {pagination && pagination.total > 0 && (
                <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-outline-variant/50 pt-8 sm:flex-row">
                  <button
                    type="button"
                    disabled={pagination.currentpage <= 1 || loading}
                    onClick={() => setPage(page - 1)}
                    className="inline-flex items-center gap-2 font-medium text-on-surface-variant transition-colors hover:text-primary disabled:pointer-events-none disabled:opacity-40"
                  >
                    <PaginationArrowIcon
                      direction="backward"
                      className="h-5 w-5 shrink-0"
                    />
                    Previous
                  </button>
                  <span className="text-sm text-on-surface-variant">
                    Page {pagination.currentpage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={pagination.nextpage == null || loading}
                    onClick={() => {
                      if (pagination.nextpage != null) setPage(pagination.nextpage);
                    }}
                    className="inline-flex items-center gap-2 font-medium text-on-surface-variant transition-colors hover:text-primary disabled:pointer-events-none disabled:opacity-40"
                  >
                    Next
                    <PaginationArrowIcon
                      direction="forward"
                      className="h-5 w-5 shrink-0"
                    />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
