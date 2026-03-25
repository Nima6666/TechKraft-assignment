"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useIsAdmin } from "@/context/admin-mode-context";
import { adminRequestHeaders } from "@/lib/admin-request";
import { api } from "@/lib/api";
import { mapApiPropertyToListing } from "@/lib/map-property";
import type { PropertyListing } from "@/lib/properties";

type State = {
  listing: PropertyListing | null;
  loading: boolean;
  error: string | null;
  notFound: boolean;
};

export function usePropertyDetail(id: string | undefined) {
  const isAdmin = useIsAdmin();
  const [retryKey, setRetryKey] = useState(0);
  const [state, setState] = useState<State>({
    listing: null,
    loading: !!id,
    error: null,
    notFound: false,
  });

  const refetch = useCallback(() => setRetryKey((k) => k + 1), []);

  useEffect(() => {
    if (!id) {
      setState({
        listing: null,
        loading: false,
        error: null,
        notFound: true,
      });
      return;
    }
    let cancelled = false;
    setState({
      listing: null,
      loading: true,
      error: null,
      notFound: false,
    });

    const path = isAdmin
      ? `/admin/properties/${encodeURIComponent(id)}`
      : `/properties/${encodeURIComponent(id)}`;
    api
      .get<unknown>(path, {
        headers: adminRequestHeaders(isAdmin),
      })
      .then((res) => {
        if (cancelled) return;
        const body = res.data as { data?: unknown };
        const raw = body?.data;
        if (raw == null) {
          setState({
            listing: null,
            loading: false,
            error: null,
            notFound: true,
          });
          return;
        }
        setState({
          listing: mapApiPropertyToListing(raw),
          loading: false,
          error: null,
          notFound: false,
        });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setState({
            listing: null,
            loading: false,
            error: null,
            notFound: true,
          });
          return;
        }
        const message =
          axios.isAxiosError(err) && err.response?.data
            ? String(
                (err.response.data as { message?: string })?.message ??
                  err.message
              )
            : err instanceof Error
              ? err.message
              : "Failed to load property";
        setState({
          listing: null,
          loading: false,
          error: message,
          notFound: false,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [id, isAdmin, retryKey]);

  return { ...state, refetch };
}
