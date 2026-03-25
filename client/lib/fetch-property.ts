import { mapApiPropertyToListing } from "@/lib/map-property";
import type { PropertyListing } from "@/lib/properties";

function apiBase(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";
}

/** Server-side fetch for listing detail (RSC). */
export async function fetchPropertyById(id: string): Promise<PropertyListing | null> {
  try {
    const res = await fetch(`${apiBase()}/properties/${encodeURIComponent(id)}`, {
      cache: "no-store",
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: unknown };
    const raw = json?.data;
    if (raw == null) return null;
    return mapApiPropertyToListing(raw);
  } catch {
    return null;
  }
}
