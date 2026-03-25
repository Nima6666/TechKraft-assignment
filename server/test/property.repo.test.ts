import test from "node:test";
import assert from "node:assert/strict";
import { PropertyRepo } from "../src/features/property/property.repo";
import type { ListPropertiesQuery } from "../src/features/property/property.list-query";

function makeQuery(partial: Partial<ListPropertiesQuery>): ListPropertiesQuery {
  return {
    page: 1,
    limit: 20,
    sort: "price_asc",
    ...partial,
  } as ListPropertiesQuery;
}

test.describe("PropertyRepo.listPaginated - suburbSortBoost path", () => {
  test.it("uses $queryRaw to order suburb matches first when suburbSortBoost is set", async () => {
    const countCalls: any[] = [];
    const countMock = async () => {
      countCalls.push([]);
      return 2;
    };

    const queryRawCalls: any[] = [];
    const queryRawMock = async () => {
      queryRawCalls.push([]);
      return [{ id: "p1" }, { id: "p2" }];
    };

    const findManyCalls: any[] = [];
    const findManyMock = async () => {
      findManyCalls.push([]);
      return [
      {
        id: "p1",
        title: "t1",
        description: null,
        price: 100000,
        propertyType: "HOUSE",
        suburb: "Kapan",
        city: "Kathmandu",
        rooms: 2,
        areaValue: null,
        areaUnit: null,
        areaSqft: 1000,
        floorArea: 900,
        agentId: "a1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "p2",
        title: "t2",
        description: null,
        price: 120000,
        propertyType: "HOUSE",
        suburb: "Other",
        city: "Kathmandu",
        rooms: 3,
        areaValue: null,
        areaUnit: null,
        areaSqft: 1200,
        floorArea: 1000,
        agentId: "a1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      ];
    };

    const prismaMock = {
      property: {
        count: countMock,
        findMany: findManyMock,
      },
      $queryRaw: queryRawMock,
    } as any;

    const repo = new PropertyRepo(prismaMock);

    const q = makeQuery({ city: "Kathmandu" });
    const res = await repo.listPaginated(0, 2, q, {
      includeInternalNotes: false,
      suburbSortBoost: "Kapan",
    } as any);

    assert.equal(countCalls.length, 1);
    assert.equal(queryRawCalls.length, 1);
    assert.equal(findManyCalls.length, 1);
    assert.equal(res.total, 2);
    assert.deepEqual(res.items.map((i) => i.id), ["p1", "p2"]);
  });
});

