export type PaginationMeta = {
  total: number;
  nextpage: number | null;
  currentpage: number;
  limit: number;
};

export type PaginatedResult<T> = {
  data: T[];
  pagination: PaginationMeta;
};

/**
 * Builds normalized pagination metadata from a page slice and totals.
 */
export function buildPaginatedResult<T>(
  data: T[],
  total: number,
  currentpage: number,
  limit: number
): PaginatedResult<T> {
  const safeLimit = limit > 0 ? limit : 1;
  const hasNext = total > 0 && currentpage * safeLimit < total;
  return {
    data,
    pagination: {
      total,
      nextpage: hasNext ? currentpage + 1 : null,
      currentpage,
      limit: safeLimit,
    },
  };
}

export type PropertyListPayload = {
  items: unknown[];
  total: number;
  page: number;
  limit: number;
};

export function isPropertyListPayload(value: unknown): value is PropertyListPayload {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    Array.isArray(v.items) &&
    typeof v.total === "number" &&
    typeof v.page === "number" &&
    typeof v.limit === "number"
  );
}

/**
 * Maps raw API `data` envelope for GET /properties into `{ data, pagination }`.
 */
export function normalizePropertyListPayload<T>(
  payload: PropertyListPayload,
  mapItem: (item: unknown) => T
): PaginatedResult<T> {
  const items = payload.items.map(mapItem);
  return buildPaginatedResult(items, payload.total, payload.page, payload.limit);
}
