export type PropertyType = "HOUSE" | "LAND";

export type PropertyListing = {
  id: string;
  title: string;
  location: string;
  price: number;
  type: PropertyType;
  rooms?: number;
  sqft?: number;
  /** Interior / built floor area when provided (houses). */
  floorArea?: number;
  highlights: { icon: string; label: string }[];
  description: string;
  /** Set when loaded with admin API access. */
  internalNotes?: string | null;
};

export function formatPriceUSD(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 0,
  }).format(n);
}
