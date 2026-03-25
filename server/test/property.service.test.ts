import test from "node:test";
import assert from "node:assert/strict";
import { PropertyService } from "../src/features/property/property.service";
import type { ListPropertiesQuery } from "../src/features/property/property.list-query";

function makeQuery(partial: Partial<ListPropertiesQuery>): ListPropertiesQuery {
  return {
    page: 1,
    limit: 20,
    sort: "newest",
    ...partial,
  } as ListPropertiesQuery;
}

test.describe("PropertyService.listPropertiesPaginated - suburb/city normalization", () => {
  test.it("prioritizes suburb when city and matching suburb are both provided", async () => {
    const calls: any[] = [];
    const repo = {
      listPaginated: async (...args: any[]) => {
        calls.push(args);
        return { items: [], total: 0 };
      },
    } as any;
    const service = new PropertyService(repo);

    const q = makeQuery({ city: "Kathmandu", suburb: "Kapan" });
    await service.listPropertiesPaginated(q, {});

    assert.equal(calls.length, 1);
    const passedQuery = calls[0][2] as ListPropertiesQuery;
    const passedOptions = calls[0][3] as any;

    assert.equal(passedQuery.city, "Kathmandu");
    assert.equal(passedQuery.suburb, undefined);
    assert.equal(passedOptions.includeInternalNotes, false);
    assert.equal(passedOptions.suburbSortBoost, "Kapan");
  });

  test.it("when city is provided but suburb belongs to different city, prioritizes city", async () => {
    const calls: any[] = [];
    const repo = {
      listPaginated: async (...args: any[]) => {
        calls.push(args);
        return { items: [], total: 0 };
      },
    } as any;
    const service = new PropertyService(repo);

    const q = makeQuery({ city: "Lalitpur", suburb: "Kapan" });
    await service.listPropertiesPaginated(q, {});

    const passedQuery = calls[0][2] as ListPropertiesQuery;
    const passedOptions = calls[0][3] as any;

    assert.equal(passedQuery.city, "Lalitpur");
    assert.equal(passedQuery.suburb, undefined);
    assert.equal(passedOptions.suburbSortBoost, undefined);
  });

  test.it("when only suburb is provided, expands to city", async () => {
    const calls: any[] = [];
    const repo = {
      listPaginated: async (...args: any[]) => {
        calls.push(args);
        return { items: [], total: 0 };
      },
    } as any;
    const service = new PropertyService(repo);

    const q = makeQuery({ suburb: "Kapan" });
    await service.listPropertiesPaginated(q, {});

    const passedQuery = calls[0][2] as ListPropertiesQuery;
    const passedOptions = calls[0][3] as any;

    assert.equal(passedQuery.city, "Kathmandu");
    assert.equal(passedQuery.suburb, undefined);
    assert.equal(passedOptions.suburbSortBoost, "Kapan");
  });
});

