"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { adminRequestHeaders } from "@/lib/admin-request";
import { api } from "@/lib/api";
import { mapApiPropertyToListing } from "@/lib/map-property";
import { useIsAdmin } from "@/context/admin-mode-context";
import type { PaginationMeta } from "@/lib/pagination";
import {
  isPropertyListPayload,
  normalizePropertyListPayload,
} from "@/lib/pagination";
import type { PropertyListing } from "@/lib/properties";
import {
  toPropertiesApiParams,
  type PropertiesListParams,
} from "@/lib/listings-query";

type ListState = {
  data: PropertyListing[];
  pagination: PaginationMeta | null;
  loading: boolean;
  error: string | null;
};

export function usePropertiesList(params: PropertiesListParams) {
  const isAdmin = useIsAdmin();
  const [retryKey, setRetryKey] = useState(0);
  const [state, setState] = useState<ListState>({
    data: [],
    pagination: null,
    loading: true,
    error: null,
  });

  const refetch = useCallback(() => setRetryKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    const path = isAdmin ? "/admin/properties" : "/properties";
    api
      .get<unknown>(path, {
        params: toPropertiesApiParams(params),
        headers: adminRequestHeaders(isAdmin),
      })
      .then((res) => {
        const body = res.data as { data?: unknown };
        const envelope = body?.data;
        if (!isPropertyListPayload(envelope)) {
          throw new Error("Unexpected list response shape");
        }
        const result = normalizePropertyListPayload(envelope, mapApiPropertyToListing);
        if (!cancelled) {
          setState({
            data: result.data,
            pagination: result.pagination,
            loading: false,
            error: null,
          });
        }
      })
      .catch((err: unknown) => {
        const message =
          axios.isAxiosError(err) && err.response?.data
            ? String(
                (err.response.data as { message?: string })?.message ??
                  err.message
              )
            : err instanceof Error
              ? err.message
              : "Failed to load properties";
        if (!cancelled) {
          setState((s) => ({
            ...s,
            loading: false,
            error: message,
          }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    params.page,
    params.limit,
    params.suburb,
    params.city,
    params.propertyType,
    params.priceMin,
    params.priceMax,
    params.roomsMin,
    params.roomsMax,
    params.floorAreaMin,
    params.floorAreaMax,
    params.lotSqftMin,
    params.lotSqftMax,
    params.sort,
    retryKey,
    isAdmin,
  ]);

  return { ...state, refetch };
}
