import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../shared/prisma";
import type { ListPropertiesQuery, ListPropertySort } from "./property.list-query";

type PropertyVisibilityOptions = {
  includeInternalNotes: boolean;
};

type ListPaginatedOptions = PropertyVisibilityOptions & {
  /** When set (suburb-only catalog expansion), listings matching this suburb sort first. */
  suburbSortBoost?: string;
};

/** Room / floor-area sorts are house-only; lot size sorts are land-only. */
function typeFromSort(sort: ListPropertySort): "HOUSE" | "LAND" | null {
  if (sort === "rooms_asc" || sort === "rooms_desc") return "HOUSE";
  if (sort === "size_asc" || sort === "size_desc") return "LAND";
  if (sort === "floor_area_asc" || sort === "floor_area_desc") return "HOUSE";
  return null;
}

/**
 * Lot sq ft filter → land only. Room / floor-area filters → house only.
 * Lot filter wins if both land and house filter params are present.
 */
function typeForcedByFilters(q: ListPropertiesQuery): "HOUSE" | "LAND" | null {
  const hasLot =
    q.lotSqftMin != null ||
    q.lotSqftMax != null;
  const hasHouse =
    q.roomsMin != null ||
    q.roomsMax != null ||
    q.floorAreaMin != null ||
    q.floorAreaMax != null;
  if (hasLot) return "LAND";
  if (hasHouse) return "HOUSE";
  return null;
}

function effectivePropertyType(
  q: ListPropertiesQuery
): "HOUSE" | "LAND" | undefined {
  const fromFilters = typeForcedByFilters(q);
  if (fromFilters != null) return fromFilters;
  const fromSort = typeFromSort(q.sort);
  if (fromSort != null) return fromSort;
  if (q.propertyType) return q.propertyType;
  return undefined;
}

function buildListWhere(q: ListPropertiesQuery): Prisma.PropertyWhereInput {
  const where: Prisma.PropertyWhereInput = {};
  if (q.city) {
    where.city = { contains: q.city, mode: "insensitive" };
  } else if (q.suburb) {
    where.suburb = { contains: q.suburb, mode: "insensitive" };
  }
  const pt = effectivePropertyType(q);
  if (pt != null) {
    where.propertyType = pt;
  }
  const priceCond: Prisma.DecimalFilter = {};
  if (q.priceMin != null) {
    priceCond.gte = q.priceMin;
  }
  if (q.priceMax != null) {
    priceCond.lte = q.priceMax;
  }
  if (Object.keys(priceCond).length > 0) {
    where.price = priceCond;
  }
  const roomsCond: Prisma.IntNullableFilter = {};
  if (q.roomsMin != null) {
    roomsCond.gte = q.roomsMin;
  }
  if (q.roomsMax != null) {
    roomsCond.lte = q.roomsMax;
  }
  if (Object.keys(roomsCond).length > 0) {
    where.rooms = roomsCond;
  }
  const floorCond: Prisma.FloatNullableFilter = {};
  if (q.floorAreaMin != null) {
    floorCond.gte = q.floorAreaMin;
  }
  if (q.floorAreaMax != null) {
    floorCond.lte = q.floorAreaMax;
  }
  if (Object.keys(floorCond).length > 0) {
    where.floorArea = floorCond;
  }
  const lotSqftCond: Prisma.DecimalFilter = {};
  if (q.lotSqftMin != null) {
    lotSqftCond.gte = q.lotSqftMin;
  }
  if (q.lotSqftMax != null) {
    lotSqftCond.lte = q.lotSqftMax;
  }
  if (Object.keys(lotSqftCond).length > 0) {
    where.areaSqft = lotSqftCond;
  }
  return where;
}

function buildListOrderBy(sort: ListPropertySort): Prisma.PropertyOrderByWithRelationInput {
  switch (sort) {
    case "newest":
      return { createdAt: "desc" };
    case "price_asc":
      return { price: "asc" };
    case "price_desc":
      return { price: "desc" };
    case "size_asc":
      return { areaSqft: { sort: "asc", nulls: "last" } };
    case "size_desc":
      return { areaSqft: { sort: "desc", nulls: "last" } };
    case "rooms_asc":
      return { rooms: { sort: "asc", nulls: "last" } };
    case "rooms_desc":
      return { rooms: { sort: "desc", nulls: "last" } };
    case "floor_area_asc":
      return { floorArea: { sort: "asc", nulls: "last" } };
    case "floor_area_desc":
      return { floorArea: { sort: "desc", nulls: "last" } };
    default:
      return { createdAt: "desc" };
  }
}

function escapeLikePattern(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

/** Mirrors `buildListWhere` for raw SQL (suburb-boost ordering path only). */
function buildListWhereSql(q: ListPropertiesQuery): Prisma.Sql {
  const parts: Prisma.Sql[] = [];
  if (q.city) {
    const pat = `%${escapeLikePattern(q.city)}%`;
    parts.push(Prisma.sql`p.city ILIKE ${pat} ESCAPE '\\'`);
  } else if (q.suburb) {
    const pat = `%${escapeLikePattern(q.suburb)}%`;
    parts.push(Prisma.sql`p.suburb ILIKE ${pat} ESCAPE '\\'`);
  }
  const pt = effectivePropertyType(q);
  if (pt != null) {
    parts.push(Prisma.sql`p."propertyType"::text = ${pt}`);
  }
  if (q.priceMin != null) {
    parts.push(Prisma.sql`p.price >= ${q.priceMin}`);
  }
  if (q.priceMax != null) {
    parts.push(Prisma.sql`p.price <= ${q.priceMax}`);
  }
  if (q.roomsMin != null) {
    parts.push(Prisma.sql`p.rooms >= ${q.roomsMin}`);
  }
  if (q.roomsMax != null) {
    parts.push(Prisma.sql`p.rooms <= ${q.roomsMax}`);
  }
  if (q.floorAreaMin != null) {
    parts.push(Prisma.sql`p."floorArea" >= ${q.floorAreaMin}`);
  }
  if (q.floorAreaMax != null) {
    parts.push(Prisma.sql`p."floorArea" <= ${q.floorAreaMax}`);
  }
  if (q.lotSqftMin != null) {
    parts.push(Prisma.sql`p."areaSqft" >= ${q.lotSqftMin}`);
  }
  if (q.lotSqftMax != null) {
    parts.push(Prisma.sql`p."areaSqft" <= ${q.lotSqftMax}`);
  }
  if (parts.length === 0) return Prisma.sql`TRUE`;
  return Prisma.join(parts, " AND ");
}

function buildSuburbBoostOrderSql(boost: string): Prisma.Sql {
  const b = boost.trim();
  const pattern = `%${escapeLikePattern(b)}%`;
  return Prisma.sql`(
    CASE
      WHEN LOWER(TRIM(COALESCE(p.suburb, ''))) = LOWER(${b}) THEN 0
      WHEN p.suburb ILIKE ${pattern} ESCAPE '\\' THEN 1
      ELSE 2
    END
  ) ASC`;
}

function buildListOrderSql(sort: ListPropertySort): Prisma.Sql {
  switch (sort) {
    case "newest":
      return Prisma.sql`p."createdAt" DESC`;
    case "price_asc":
      return Prisma.sql`p.price ASC`;
    case "price_desc":
      return Prisma.sql`p.price DESC`;
    case "size_asc":
      return Prisma.sql`p."areaSqft" ASC NULLS LAST`;
    case "size_desc":
      return Prisma.sql`p."areaSqft" DESC NULLS LAST`;
    case "rooms_asc":
      return Prisma.sql`p.rooms ASC NULLS LAST`;
    case "rooms_desc":
      return Prisma.sql`p.rooms DESC NULLS LAST`;
    case "floor_area_asc":
      return Prisma.sql`p."floorArea" ASC NULLS LAST`;
    case "floor_area_desc":
      return Prisma.sql`p."floorArea" DESC NULLS LAST`;
    default:
      return Prisma.sql`p."createdAt" DESC`;
  }
}

const publicPropertySelect = {
  id: true,
  title: true,
  description: true,
  price: true,
  propertyType: true,
  suburb: true,
  city: true,
  rooms: true,
  areaValue: true,
  areaUnit: true,
  areaSqft: true,
  floorArea: true,
  agentId: true,
  createdAt: true,
  updatedAt: true,
} as const;

const adminPropertySelect = {
  ...publicPropertySelect,
  internalNotes: true,
} as const;

export class PropertyRepo {
  constructor(private readonly db = prisma) {}

  async create(data: Prisma.PropertyUncheckedCreateInput) {
    return this.db.property.create({ data });
  }

  async getById(id: string, options: PropertyVisibilityOptions) {
    return this.db.property.findUnique({
      where: { id },
      select: options.includeInternalNotes
        ? adminPropertySelect
        : publicPropertySelect,
    });
  }

  async getAll(options: PropertyVisibilityOptions) {
    return this.db.property.findMany({
      orderBy: { createdAt: "desc" },
      select: options.includeInternalNotes
        ? adminPropertySelect
        : publicPropertySelect,
    });
  }

  async listPaginated(
    skip: number,
    take: number,
    query: ListPropertiesQuery,
    options: ListPaginatedOptions
  ): Promise<{ items: Awaited<ReturnType<PropertyRepo["getAll"]>>; total: number }> {
    const select = options.includeInternalNotes
      ? adminPropertySelect
      : publicPropertySelect;
    const where = buildListWhere(query);
    const total = await this.db.property.count({ where });

    if (!options.suburbSortBoost?.trim()) {
      const orderBy = buildListOrderBy(query.sort);
      const items = await this.db.property.findMany({
        where,
        skip,
        take,
        orderBy,
        select,
      });
      return { items, total };
    }

    const whereSql = buildListWhereSql(query);
    const orderSql = Prisma.join(
      [buildSuburbBoostOrderSql(options.suburbSortBoost), buildListOrderSql(query.sort)],
      ", "
    );
    const idRows = await this.db.$queryRaw<{ id: string }[]>(Prisma.sql`
      SELECT p.id
      FROM "Property" p
      WHERE ${whereSql}
      ORDER BY ${orderSql}
      LIMIT ${take} OFFSET ${skip}
    `);
    const ids = idRows.map((r) => r.id);
    if (ids.length === 0) {
      return { items: [], total };
    }

    const rows = await this.db.property.findMany({
      where: { id: { in: ids } },
      select,
    });
    const byId = new Map(rows.map((r) => [r.id, r]));
    const items = ids.map((id) => byId.get(id)).filter((row): row is NonNullable<typeof row> => row != null);
    return { items, total };
  }
}
