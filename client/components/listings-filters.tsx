"use client";

import { useEffect, useState } from "react";
import type { ListingSort } from "@/lib/listings-query";
import { LISTING_SORT_VALUES } from "@/lib/listings-query";
import type { PropertyType } from "@/lib/properties";

const SORT_LABELS: Record<ListingSort, string> = {
  newest: "Newest first",
  price_asc: "Price: low → high",
  price_desc: "Price: high → low",
  size_asc: "Lot size (land only): small → large",
  size_desc: "Lot size (land only): large → small",
  rooms_asc: "Rooms (houses only): few → many",
  rooms_desc: "Rooms (houses only): many → few",
  floor_area_asc: "House floor area: small → large",
  floor_area_desc: "House floor area: large → small",
};

/** Applied min/max in URL → server forces house or land. */
function filterTypeLockFromUrl(
  roomsMinUrl: string,
  roomsMaxUrl: string,
  floorAreaMinUrl: string,
  floorAreaMaxUrl: string,
  lotSqftMinUrl: string,
  lotSqftMaxUrl: string
): { type: PropertyType; label: string } | null {
  const hasLot =
    lotSqftMinUrl.trim() !== "" || lotSqftMaxUrl.trim() !== "";
  const hasHouse =
    roomsMinUrl.trim() !== "" ||
    roomsMaxUrl.trim() !== "" ||
    floorAreaMinUrl.trim() !== "" ||
    floorAreaMaxUrl.trim() !== "";
  if (hasLot && hasHouse) {
    return {
      type: "LAND",
      label:
        "Land is selected — lot size (normalized sq ft) takes precedence when both lot and house filters are set. Server lists land only.",
    };
  }
  if (hasLot) {
    return {
      type: "LAND",
      label:
        "Land is selected — lot size filter uses normalized sq ft on parcels.",
    };
  }
  if (hasHouse) {
    return {
      type: "HOUSE",
      label:
        "House is selected — room and floor area filters apply only to houses.",
    };
  }
  return null;
}

/** Sorts that force a property type on the server (and in the URL). */
function sortTypeLock(sort: ListingSort): {
  type: PropertyType;
  label: string;
} | null {
  if (sort === "rooms_asc" || sort === "rooms_desc") {
    return {
      type: "HOUSE",
      label:
        "House is selected — room sort only applies to houses.",
    };
  }
  if (sort === "floor_area_asc" || sort === "floor_area_desc") {
    return {
      type: "HOUSE",
      label:
        "House is selected — floor area sort only applies to houses.",
    };
  }
  if (sort === "size_asc" || sort === "size_desc") {
    return {
      type: "LAND",
      label:
        "Land is selected — lot size sort only applies to land.",
    };
  }
  return null;
}

type Props = {
  suburbUrl: string;
  cityUrl: string;
  propertyTypeUrl: PropertyType | "";
  priceMinUrl: string;
  priceMaxUrl: string;
  roomsMinUrl: string;
  roomsMaxUrl: string;
  floorAreaMinUrl: string;
  floorAreaMaxUrl: string;
  lotSqftMinUrl: string;
  lotSqftMaxUrl: string;
  sortUrl: ListingSort;
  /** Merge into URL; omit or empty string removes param. Resets page to 1 when `resetPage` is true. */
  mergeQuery: (
    updates: Record<string, string | undefined>,
    resetPage?: boolean
  ) => void;
};

export function ListingsFilters({
  suburbUrl,
  cityUrl,
  propertyTypeUrl,
  priceMinUrl,
  priceMaxUrl,
  roomsMinUrl,
  roomsMaxUrl,
  floorAreaMinUrl,
  floorAreaMaxUrl,
  lotSqftMinUrl,
  lotSqftMaxUrl,
  sortUrl,
  mergeQuery,
}: Props) {
  const [suburb, setSuburb] = useState(suburbUrl);
  const [city, setCity] = useState(cityUrl);
  const [priceMin, setPriceMin] = useState(priceMinUrl);
  const [priceMax, setPriceMax] = useState(priceMaxUrl);
  const [roomsMin, setRoomsMin] = useState(roomsMinUrl);
  const [roomsMax, setRoomsMax] = useState(roomsMaxUrl);
  const [floorAreaMin, setFloorAreaMin] = useState(floorAreaMinUrl);
  const [floorAreaMax, setFloorAreaMax] = useState(floorAreaMaxUrl);
  const [lotSqftMin, setLotSqftMin] = useState(lotSqftMinUrl);
  const [lotSqftMax, setLotSqftMax] = useState(lotSqftMaxUrl);

  useEffect(() => {
    setSuburb(suburbUrl);
    setCity(cityUrl);
    setPriceMin(priceMinUrl);
    setPriceMax(priceMaxUrl);
    setRoomsMin(roomsMinUrl);
    setRoomsMax(roomsMaxUrl);
    setFloorAreaMin(floorAreaMinUrl);
    setFloorAreaMax(floorAreaMaxUrl);
    setLotSqftMin(lotSqftMinUrl);
    setLotSqftMax(lotSqftMaxUrl);
  }, [
    suburbUrl,
    cityUrl,
    priceMinUrl,
    priceMaxUrl,
    roomsMinUrl,
    roomsMaxUrl,
    floorAreaMinUrl,
    floorAreaMaxUrl,
    lotSqftMinUrl,
    lotSqftMaxUrl,
  ]);

  const filterLock = filterTypeLockFromUrl(
    roomsMinUrl,
    roomsMaxUrl,
    floorAreaMinUrl,
    floorAreaMaxUrl,
    lotSqftMinUrl,
    lotSqftMaxUrl
  );
  const sortLock = sortTypeLock(sortUrl);
  const typeLock = filterLock ?? sortLock;
  const sortConflictsWithLock =
    filterLock != null &&
    sortLock != null &&
    filterLock.type !== sortLock.type;
  const propertyTypeSelectValue =
    typeLock?.type ?? (propertyTypeUrl || "");

  /** Type-specific filters only after House or Land is chosen (or forced by URL/sort). */
  const showHouseFilters = propertyTypeSelectValue === "HOUSE";
  const showLandFilters = propertyTypeSelectValue === "LAND";

  const onPropertyTypeChange = (value: string) => {
    const updates: Record<string, string | undefined> = {
      propertyType: value || undefined,
    };
    if (value === "") {
      updates.roomsMin = undefined;
      updates.roomsMax = undefined;
      updates.floorAreaMin = undefined;
      updates.floorAreaMax = undefined;
      updates.lotSqftMin = undefined;
      updates.lotSqftMax = undefined;
    } else if (value === "HOUSE") {
      updates.lotSqftMin = undefined;
      updates.lotSqftMax = undefined;
    } else if (value === "LAND") {
      updates.roomsMin = undefined;
      updates.roomsMax = undefined;
      updates.floorAreaMin = undefined;
      updates.floorAreaMax = undefined;
    }
    mergeQuery(updates, true);
  };

  const applyFilters = () => {
    const hasLot =
      lotSqftMin.trim() !== "" || lotSqftMax.trim() !== "";
    const hasHouse =
      roomsMin.trim() !== "" ||
      roomsMax.trim() !== "" ||
      floorAreaMin.trim() !== "" ||
      floorAreaMax.trim() !== "";

    const updates: Record<string, string | undefined> = {
      suburb: suburb.trim() || undefined,
      city: city.trim() || undefined,
      priceMin: priceMin.trim() || undefined,
      priceMax: priceMax.trim() || undefined,
    };

    if (propertyTypeSelectValue === "HOUSE") {
      updates.roomsMin = roomsMin.trim() || undefined;
      updates.roomsMax = roomsMax.trim() || undefined;
      updates.floorAreaMin = floorAreaMin.trim() || undefined;
      updates.floorAreaMax = floorAreaMax.trim() || undefined;
      updates.lotSqftMin = undefined;
      updates.lotSqftMax = undefined;
      if (hasHouse) updates.propertyType = "HOUSE";
    } else if (propertyTypeSelectValue === "LAND") {
      updates.lotSqftMin = lotSqftMin.trim() || undefined;
      updates.lotSqftMax = lotSqftMax.trim() || undefined;
      updates.roomsMin = undefined;
      updates.roomsMax = undefined;
      updates.floorAreaMin = undefined;
      updates.floorAreaMax = undefined;
      if (hasLot) updates.propertyType = "LAND";
    } else {
      updates.roomsMin = undefined;
      updates.roomsMax = undefined;
      updates.floorAreaMin = undefined;
      updates.floorAreaMax = undefined;
      updates.lotSqftMin = undefined;
      updates.lotSqftMax = undefined;
    }

    mergeQuery(updates, true);
  };

  const onSortChange = (sort: ListingSort) => {
    const updates: Record<string, string | undefined> = { sort };
    if (
      sort === "rooms_asc" ||
      sort === "rooms_desc" ||
      sort === "floor_area_asc" ||
      sort === "floor_area_desc"
    ) {
      updates.propertyType = "HOUSE";
      updates.lotSqftMin = undefined;
      updates.lotSqftMax = undefined;
    } else if (sort === "size_asc" || sort === "size_desc") {
      updates.propertyType = "LAND";
      updates.roomsMin = undefined;
      updates.roomsMax = undefined;
      updates.floorAreaMin = undefined;
      updates.floorAreaMax = undefined;
    }
    mergeQuery(updates, true);
  };

  const hasActiveFilters =
    suburbUrl.trim() !== "" ||
    cityUrl.trim() !== "" ||
    priceMinUrl.trim() !== "" ||
    priceMaxUrl.trim() !== "" ||
    roomsMinUrl.trim() !== "" ||
    roomsMaxUrl.trim() !== "" ||
    floorAreaMinUrl.trim() !== "" ||
    floorAreaMaxUrl.trim() !== "" ||
    lotSqftMinUrl.trim() !== "" ||
    lotSqftMaxUrl.trim() !== "" ||
    propertyTypeUrl !== "" ||
    sortUrl !== "newest";

  const clearFilters = () => {
    mergeQuery(
      {
        suburb: undefined,
        city: undefined,
        propertyType: undefined,
        priceMin: undefined,
        priceMax: undefined,
        roomsMin: undefined,
        roomsMax: undefined,
        floorAreaMin: undefined,
        floorAreaMax: undefined,
        lotSqftMin: undefined,
        lotSqftMax: undefined,
        sort: undefined,
      },
      true
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label
          htmlFor="filter-suburb"
          className="mb-1 block text-xs font-semibold text-on-surface-variant"
        >
          Suburb
        </label>
        <input
          id="filter-suburb"
          type="text"
          value={suburb}
          onChange={(e) => setSuburb(e.target.value)}
          placeholder="Baneshwor"
          className="w-full rounded-lg border border-outline-variant/50 bg-white px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
      </div>
      <div>
        <label
          htmlFor="filter-city"
          className="mb-1 block text-xs font-semibold text-on-surface-variant"
        >
          City
        </label>
        <input
          id="filter-city"
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Kathmandu"
          className="w-full rounded-lg border border-outline-variant/50 bg-white px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
      </div>
      <div>
        <label
          htmlFor="filter-type"
          className="mb-1 block text-xs font-semibold text-on-surface-variant"
        >
          Property type
          {typeLock ? (
            <span className="ml-1 font-normal normal-case text-primary">
              (set by sort or filter)
            </span>
          ) : null}
        </label>
        <select
          id="filter-type"
          value={propertyTypeSelectValue}
          disabled={typeLock != null}
          title={
            typeLock
              ? "Change sort or clear forcing filters to choose All types again."
              : undefined
          }
          aria-describedby={typeLock ? "filter-type-lock-hint" : undefined}
          onChange={(e) => onPropertyTypeChange(e.target.value)}
          className="w-full rounded-lg border border-outline-variant/50 bg-white px-3 py-2 text-sm font-medium text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 disabled:cursor-not-allowed disabled:bg-surface-container-high/80 disabled:text-on-surface-variant"
        >
          <option value="">All types</option>
          <option value="HOUSE">House</option>
          <option value="LAND">Land</option>
        </select>
        {typeLock ? (
          <p
            id="filter-type-lock-hint"
            className="mt-2 rounded-lg border border-primary/25 bg-primary-container/35 px-3 py-2 text-xs leading-snug text-on-surface"
          >
            <span className="font-semibold text-primary">Active type rule: </span>
            {typeLock.label}
            {sortConflictsWithLock
              ? ` Current sort would imply ${sortLock.type === "LAND" ? "land" : "house"}-only results; applied filters/server rule use ${filterLock!.type} first.`
              : null}
          </p>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label
            htmlFor="filter-price-min"
            className="mb-1 block text-xs font-semibold text-on-surface-variant"
          >
            Min price
          </label>
          <input
            id="filter-price-min"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            placeholder="Min"
            className="w-full rounded-lg border border-outline-variant/50 bg-white px-3 py-2 text-sm text-on-surface tabular-nums placeholder:text-on-surface-variant/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>
        <div>
          <label
            htmlFor="filter-price-max"
            className="mb-1 block text-xs font-semibold text-on-surface-variant"
          >
            Max price
          </label>
          <input
            id="filter-price-max"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            placeholder="Max"
            className="w-full rounded-lg border border-outline-variant/50 bg-white px-3 py-2 text-sm text-on-surface tabular-nums placeholder:text-on-surface-variant/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>
      </div>
      {showHouseFilters ? (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label
                htmlFor="filter-rooms-min"
                className="mb-1 block text-xs font-semibold text-on-surface-variant"
              >
                Min rooms
              </label>
              <input
                id="filter-rooms-min"
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                value={roomsMin}
                onChange={(e) => setRoomsMin(e.target.value)}
                placeholder="Min"
                className="w-full rounded-lg border border-outline-variant/50 bg-white px-3 py-2 text-sm text-on-surface tabular-nums placeholder:text-on-surface-variant/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
            <div>
              <label
                htmlFor="filter-rooms-max"
                className="mb-1 block text-xs font-semibold text-on-surface-variant"
              >
                Max rooms
              </label>
              <input
                id="filter-rooms-max"
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                value={roomsMax}
                onChange={(e) => setRoomsMax(e.target.value)}
                placeholder="Max"
                className="w-full rounded-lg border border-outline-variant/50 bg-white px-3 py-2 text-sm text-on-surface tabular-nums placeholder:text-on-surface-variant/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label
                htmlFor="filter-floor-min"
                className="mb-1 block text-xs font-semibold text-on-surface-variant"
              >
                Min floor area
              </label>
              <input
                id="filter-floor-min"
                type="number"
                inputMode="decimal"
                min={0}
                step="any"
                value={floorAreaMin}
                onChange={(e) => setFloorAreaMin(e.target.value)}
                placeholder="Min"
                className="w-full rounded-lg border border-outline-variant/50 bg-white px-3 py-2 text-sm text-on-surface tabular-nums placeholder:text-on-surface-variant/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
            <div>
              <label
                htmlFor="filter-floor-max"
                className="mb-1 block text-xs font-semibold text-on-surface-variant"
              >
                Max floor area
              </label>
              <input
                id="filter-floor-max"
                type="number"
                inputMode="decimal"
                min={0}
                step="any"
                value={floorAreaMax}
                onChange={(e) => setFloorAreaMax(e.target.value)}
                placeholder="Max"
                className="w-full rounded-lg border border-outline-variant/50 bg-white px-3 py-2 text-sm text-on-surface tabular-nums placeholder:text-on-surface-variant/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
          </div>
          <p className="text-[10px] leading-snug text-on-surface-variant">
            Floor area is stored per house (your data unit). Room/floor filters force
            House on the server.
          </p>
        </>
      ) : null}
      {showLandFilters ? (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label
                htmlFor="filter-lot-sqft-min"
                className="mb-1 block text-xs font-semibold text-on-surface-variant"
              >
                Min lot (sq ft)
              </label>
              <input
                id="filter-lot-sqft-min"
                type="number"
                inputMode="decimal"
                min={0}
                step="any"
                value={lotSqftMin}
                onChange={(e) => setLotSqftMin(e.target.value)}
                placeholder="Min"
                className="w-full rounded-lg border border-outline-variant/50 bg-white px-3 py-2 text-sm text-on-surface tabular-nums placeholder:text-on-surface-variant/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
            <div>
              <label
                htmlFor="filter-lot-sqft-max"
                className="mb-1 block text-xs font-semibold text-on-surface-variant"
              >
                Max lot (sq ft)
              </label>
              <input
                id="filter-lot-sqft-max"
                type="number"
                inputMode="decimal"
                min={0}
                step="any"
                value={lotSqftMax}
                onChange={(e) => setLotSqftMax(e.target.value)}
                placeholder="Max"
                className="w-full rounded-lg border border-outline-variant/50 bg-white px-3 py-2 text-sm text-on-surface tabular-nums placeholder:text-on-surface-variant/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
          </div>
          <p className="text-[10px] leading-snug text-on-surface-variant">
            Lot size uses normalized square feet (same as lot-size sort). This filter
            forces Land on the server.
          </p>
        </>
      ) : null}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <button
          type="button"
          onClick={applyFilters}
          className="min-h-[2.75rem] flex-1 rounded-lg bg-primary px-3 py-2 text-center text-sm font-semibold text-on-primary transition hover:opacity-95 active:scale-[0.99]"
        >
          Apply filters
        </button>
        <button
          type="button"
          onClick={clearFilters}
          disabled={!hasActiveFilters}
          className="min-h-[2.75rem] rounded-lg border border-outline-variant/60 bg-surface-container px-3 py-2 text-center text-sm font-semibold text-on-surface transition hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-45 sm:min-w-[9rem]"
        >
          Clear filters
        </button>
      </div>
      <div>
        <label
          htmlFor="filter-sort"
          className="mb-1 block text-xs font-semibold text-on-surface-variant"
        >
          Sort
        </label>
        <select
          id="filter-sort"
          value={sortUrl}
          onChange={(e) => onSortChange(e.target.value as ListingSort)}
          className="w-full cursor-pointer rounded-lg border border-outline-variant/50 bg-white px-3 py-2 text-sm font-medium text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
        >
          {LISTING_SORT_VALUES.map((v) => (
            <option key={v} value={v}>
              {SORT_LABELS[v]}
            </option>
          ))}
        </select>
      </div>
      <p className="text-[11px] leading-snug text-on-surface-variant/90">
        {propertyTypeSelectValue === ""
          ? "With All types, only location and price apply here. Pick House or Land to see rooms, floor area, or lot size. Sorts that only affect houses or land still lock type in the URL."
          : propertyTypeSelectValue === "HOUSE"
            ? "House filters (rooms, floor area) apply on the server. Choose Land for lot size."
            : "Land filters (lot sq ft) apply on the server. Choose House for rooms and floor area."}
      </p>
    </div>
  );
}
