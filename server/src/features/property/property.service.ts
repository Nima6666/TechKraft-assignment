import { findCityForSuburb } from "../../shared/suburbs-by-city";
import { buildPropertyUncheckedCreateInput } from "./property.create-data";
import type { ListPropertiesQuery } from "./property.list-query";
import { PropertyRepo } from "./property.repo";
import type { CreatePropertyPayload } from "./property.validation";
import { normalizeAreaToSqft } from "./utils/area";

/**
 * If both city and suburb are set, suburb is dropped (city-only filter).
 * If only suburb is set and it matches the catalog, expand to that metro `city`
 * and clear `suburb` so the repo filters by city; otherwise keep `suburb`.
 *
 * `suburbSortBoost` is the original suburb phrase when we expanded to metro — used
 * to order matching suburbs first, then other suburbs in the same city.
 */
function normalizeListLocation(query: ListPropertiesQuery): {
  query: ListPropertiesQuery;
  suburbSortBoost?: string;
} {
  let city = query.city;
  let suburb = query.suburb;
  let suburbSortBoost: string | undefined;
  if (city) {
    // When both `city` and `suburb` are provided:
    // - If suburb belongs to this city (catalog match), keep city filter but boost suburb ordering.
    // - If suburb belongs to a different city, ignore suburb and prioritize city.
    if (suburb) {
      const metro = findCityForSuburb(suburb);
      if (metro && metro.toLowerCase() === city.toLowerCase()) {
        suburbSortBoost = suburb.trim();
      }
    }
    // Always use city for filtering when city is explicitly provided.
    suburb = undefined;
  } else if (suburb) {
    const metro = findCityForSuburb(suburb);
    if (metro) {
      suburbSortBoost = suburb.trim();
      city = metro;
      suburb = undefined;
    }
  }
  return { query: { ...query, city, suburb }, suburbSortBoost };
}

type PropertyVisibilityOptions = {
  includeInternalNotes?: boolean;
};

export class PropertyService {
  constructor(private readonly repo: PropertyRepo) {}

  async createProperty(payload: CreatePropertyPayload) {
    const areaSqft = normalizeAreaToSqft(payload.areaValue, payload.areaUnit);
    const data = buildPropertyUncheckedCreateInput(payload, areaSqft);
    return this.repo.create(data);
  }

  async getPropertyById(id: string, options: PropertyVisibilityOptions = {}) {
    return this.repo.getById(id, {
      includeInternalNotes: options.includeInternalNotes ?? false,
    });
  }

  async listProperties(options: PropertyVisibilityOptions = {}) {
    return this.repo.getAll({
      includeInternalNotes: options.includeInternalNotes ?? false,
    });
  }

  async listPropertiesPaginated(
    query: ListPropertiesQuery,
    options: PropertyVisibilityOptions = {}
  ) {
    const { query: q, suburbSortBoost } = normalizeListLocation(query);
    const skip = (q.page - 1) * q.limit;
    return this.repo.listPaginated(skip, q.limit, q, {
      includeInternalNotes: options.includeInternalNotes ?? false,
      suburbSortBoost,
    });
  }
}
