import type { PropertyType } from "@/lib/properties";

/** Shape returned by GET /properties and GET /properties/:id (public select). */
export type ApiProperty = {
  id: string;
  title: string;
  description: string | null;
  price: string | number;
  propertyType: PropertyType;
  suburb: string | null;
  city: string;
  rooms: number | null;
  areaValue: number | null;
  areaUnit: string | null;
  areaSqft: string | number | null;
  floorArea: number | null;
  agentId: string;
  createdAt: string;
  updatedAt: string;
  /** Present only when the request included the admin header. */
  internalNotes?: string | null;
};

export function isApiProperty(value: unknown): value is ApiProperty {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return typeof v.id === "string" && typeof v.title === "string" && typeof v.city === "string";
}
