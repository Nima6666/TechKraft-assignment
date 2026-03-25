import type { ApiProperty } from "@/lib/api-property";
import type { PropertyListing } from "@/lib/properties";

function num(v: string | number | null | undefined): number | undefined {
  if (v == null) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function buildHighlights(p: ApiProperty): PropertyListing["highlights"] {
  const t = p.propertyType;
  const out: PropertyListing["highlights"] = [];

  if (t === "HOUSE") {
    if (p.rooms != null) out.push({ icon: "meeting_room", label: `${p.rooms} Rooms` });
    if (p.floorArea != null && Number.isFinite(p.floorArea)) {
      out.push({
        icon: "aspect_ratio",
        label: `${p.floorArea.toLocaleString()} floor area`,
      });
    }
    const sq = num(p.areaSqft);
    if (sq != null) out.push({ icon: "square_foot", label: `${sq.toLocaleString()} sqft` });
    return out.length ? out : [{ icon: "home", label: t }];
  }

  if (t === "LAND") {
    if (p.areaValue != null && p.areaUnit)
      out.push({ icon: "aspect_ratio", label: `${p.areaValue} ${p.areaUnit}` });
    else out.push({ icon: "landscape", label: "Land" });
    return out;
  }

  return [{ icon: "domain", label: t }];
}

export function mapApiPropertyToListing(raw: unknown): PropertyListing {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid property payload");
  }
  const p = raw as ApiProperty;
  const price = num(p.price) ?? 0;
  const sqft = num(p.areaSqft);

  const location = [p.suburb, p.city].filter(Boolean).join(", ") || p.city;

  const internalNotes =
    typeof p === "object" &&
    p !== null &&
    "internalNotes" in p &&
    (p as ApiProperty).internalNotes !== undefined
      ? (p as ApiProperty).internalNotes
      : undefined;

  return {
    id: p.id,
    title: p.title,
    location,
    price,
    type: p.propertyType,
    rooms: p.rooms ?? undefined,
    sqft,
    floorArea:
      p.floorArea != null && Number.isFinite(p.floorArea)
        ? p.floorArea
        : undefined,
    highlights: buildHighlights(p),
    description: p.description ?? "",
    ...(internalNotes !== undefined ? { internalNotes } : {}),
  };
}
