import type { Prisma } from "../../../generated/prisma/client";
import type { CreatePropertyPayload } from "./property.validation";

export function buildPropertyUncheckedCreateInput(
  payload: CreatePropertyPayload,
  areaSqft: number | null
): Prisma.PropertyUncheckedCreateInput {
  const base = {
    title: payload.title,
    description: payload.description ?? null,
    price: payload.price,
    propertyType: payload.propertyType,
    suburb: payload.suburb ?? null,
    city: payload.city,
    agentId: payload.agentId,
    internalNotes: payload.internalNotes ?? null,
  };

  switch (payload.propertyType) {
    case "HOUSE":
      return {
        ...base,
        rooms: payload.rooms,
        floorArea: payload.floorArea,
        areaSqft,
      };
    case "LAND":
      return {
        ...base,
        areaValue: payload.areaValue,
        areaUnit: payload.areaUnit,
        areaSqft,
      };
    default: {
      const _exhaustive: never = payload.propertyType;
      return _exhaustive;
    }
  }
}
