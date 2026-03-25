import type { PropertyType } from "@/lib/properties";

export const LISTING_PAGE_LIMITS = [20, 50, 100] as const;

export type ListingPageLimit = (typeof LISTING_PAGE_LIMITS)[number];

export const LISTING_SORT_VALUES = [
  "newest",
  "price_asc",
  "price_desc",
  "size_asc",
  "size_desc",
  "rooms_asc",
  "rooms_desc",
  "floor_area_asc",
  "floor_area_desc",
] as const;

export type ListingSort = (typeof LISTING_SORT_VALUES)[number];

export type PropertiesListParams = {
  page: number;
  limit: ListingPageLimit;
  suburb?: string;
  city?: string;
  propertyType?: PropertyType;
  priceMin?: number;
  priceMax?: number;
  roomsMin?: number;
  roomsMax?: number;
  floorAreaMin?: number;
  floorAreaMax?: number;
  /** Normalized lot size (sq ft) — land only, server-enforced. */
  lotSqftMin?: number;
  lotSqftMax?: number;
  sort: ListingSort;
};

export function parseListingLimit(value: string | null): ListingPageLimit {
  const n = Number(value);
  return LISTING_PAGE_LIMITS.includes(n as ListingPageLimit)
    ? (n as ListingPageLimit)
    : 20;
}

export function parseListingPage(value: string | null): number {
  const n = parseInt(value ?? "1", 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

export function parseListingSort(value: string | null): ListingSort {
  if (value && LISTING_SORT_VALUES.includes(value as ListingSort)) {
    return value as ListingSort;
  }
  return "newest";
}

function parseOptionalPrice(value: string | null): number | undefined {
  if (value == null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

function parseOptionalRooms(value: string | null): number | undefined {
  if (value == null || value === "") return undefined;
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

function parseOptionalFloorArea(value: string | null): number | undefined {
  if (value == null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

/** Read listing list state from the URL (shareable + reload-safe). */
export function parsePropertiesListParams(
  sp: Pick<URLSearchParams, "get">
): PropertiesListParams {
  const page = parseListingPage(sp.get("page"));
  const limit = parseListingLimit(sp.get("limit"));
  const sort = parseListingSort(sp.get("sort"));
  const suburbRaw = sp.get("suburb")?.trim();
  const suburb = suburbRaw ? suburbRaw : undefined;
  const cityRaw = sp.get("city")?.trim();
  const city = cityRaw ? cityRaw : undefined;
  const pt = sp.get("propertyType")?.trim().toUpperCase();
  const propertyType =
    pt === "HOUSE" || pt === "LAND" ? (pt as PropertyType) : undefined;
  const priceMin = parseOptionalPrice(sp.get("priceMin"));
  const priceMax = parseOptionalPrice(sp.get("priceMax"));
  const roomsMin = parseOptionalRooms(sp.get("roomsMin"));
  const roomsMax = parseOptionalRooms(sp.get("roomsMax"));
  const floorAreaMin = parseOptionalFloorArea(sp.get("floorAreaMin"));
  const floorAreaMax = parseOptionalFloorArea(sp.get("floorAreaMax"));
  const lotSqftMin = parseOptionalFloorArea(sp.get("lotSqftMin"));
  const lotSqftMax = parseOptionalFloorArea(sp.get("lotSqftMax"));
  return {
    page,
    limit,
    suburb,
    city,
    propertyType,
    priceMin,
    priceMax,
    roomsMin,
    roomsMax,
    floorAreaMin,
    floorAreaMax,
    lotSqftMin,
    lotSqftMax,
    sort,
  };
}

/** Strip undefined for axios `params` so we do not send empty keys. */
export function toPropertiesApiParams(
  p: PropertiesListParams
): Record<string, string | number> {
  const out: Record<string, string | number> = {
    page: p.page,
    limit: p.limit,
    sort: p.sort,
  };
  if (p.suburb) out.suburb = p.suburb;
  if (p.city) out.city = p.city;
  if (p.propertyType) out.propertyType = p.propertyType;
  if (p.priceMin != null) out.priceMin = p.priceMin;
  if (p.priceMax != null) out.priceMax = p.priceMax;
  if (p.roomsMin != null) out.roomsMin = p.roomsMin;
  if (p.roomsMax != null) out.roomsMax = p.roomsMax;
  if (p.floorAreaMin != null) out.floorAreaMin = p.floorAreaMin;
  if (p.floorAreaMax != null) out.floorAreaMax = p.floorAreaMax;
  if (p.lotSqftMin != null) out.lotSqftMin = p.lotSqftMin;
  if (p.lotSqftMax != null) out.lotSqftMax = p.lotSqftMax;
  return out;
}
