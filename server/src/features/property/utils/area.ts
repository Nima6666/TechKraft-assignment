export type AreaUnit = "SQFT" | "SQM" | "ROPANI" | "AANA" | "BIGHA";

// units conversion constants
const SQFT_PER_UNIT: Record<AreaUnit, number> = {
  SQFT: 1,
  SQM: 10.7639,
  ROPANI: 5476,
  AANA: 342.25,
  BIGHA: 72900,
};

export function toSqft(areaValue: number, areaUnit: AreaUnit): number {
  if (!Number.isFinite(areaValue) || areaValue < 0) {
    throw new Error("areaValue must be a non-negative finite number");
  }

  return areaValue * SQFT_PER_UNIT[areaUnit];
}

export function roundSqftForStorage(value: number): number {
  return Number(value.toFixed(4));
}

export function normalizeAreaToSqft(
  areaValue?: number | null,
  areaUnit?: AreaUnit | null
): number | null {
  if (areaValue == null || areaUnit == null) {
    return null;
  }

  return roundSqftForStorage(toSqft(areaValue, areaUnit));
}
