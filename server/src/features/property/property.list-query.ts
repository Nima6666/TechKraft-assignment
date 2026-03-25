import { z } from "zod";

const emptyToUndefined = (v: unknown) =>
  v === "" || v === undefined || v === null ? undefined : v;

export const listPropertySortSchema = z.enum([
  "newest",
  "price_asc",
  "price_desc",
  "size_asc",
  "size_desc",
  "rooms_asc",
  "rooms_desc",
  "floor_area_asc",
  "floor_area_desc",
]);

export type ListPropertySort = z.infer<typeof listPropertySortSchema>;

export const listPropertiesQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    suburb: z.preprocess(
      emptyToUndefined,
      z.string().trim().min(1).optional()
    ),
    city: z.preprocess(emptyToUndefined, z.string().trim().min(1).optional()),
    propertyType: z.preprocess(
      emptyToUndefined,
      z.enum(["HOUSE", "LAND"]).optional()
    ),
    priceMin: z.preprocess(emptyToUndefined, z.coerce.number().min(0).optional()),
    priceMax: z.preprocess(emptyToUndefined, z.coerce.number().min(0).optional()),
    roomsMin: z.preprocess(
      emptyToUndefined,
      z.coerce.number().int().min(0).optional()
    ),
    roomsMax: z.preprocess(
      emptyToUndefined,
      z.coerce.number().int().min(0).optional()
    ),
    floorAreaMin: z.preprocess(
      emptyToUndefined,
      z.coerce.number().min(0).optional()
    ),
    floorAreaMax: z.preprocess(
      emptyToUndefined,
      z.coerce.number().min(0).optional()
    ),
    lotSqftMin: z.preprocess(
      emptyToUndefined,
      z.coerce.number().min(0).optional()
    ),
    lotSqftMax: z.preprocess(
      emptyToUndefined,
      z.coerce.number().min(0).optional()
    ),
    sort: z
      .string()
      .optional()
      .transform((s) => {
        const p = listPropertySortSchema.safeParse(s ?? "newest");
        return p.success ? p.data : "newest";
      }),
  })
  .superRefine((data, ctx) => {
    if (
      data.priceMin != null &&
      data.priceMax != null &&
      data.priceMin > data.priceMax
    ) {
      ctx.addIssue({
        code: "custom",
        message: "priceMin must be less than or equal to priceMax",
        path: ["priceMin"],
      });
    }
    if (
      data.roomsMin != null &&
      data.roomsMax != null &&
      data.roomsMin > data.roomsMax
    ) {
      ctx.addIssue({
        code: "custom",
        message: "roomsMin must be less than or equal to roomsMax",
        path: ["roomsMin"],
      });
    }
    if (
      data.floorAreaMin != null &&
      data.floorAreaMax != null &&
      data.floorAreaMin > data.floorAreaMax
    ) {
      ctx.addIssue({
        code: "custom",
        message: "floorAreaMin must be less than or equal to floorAreaMax",
        path: ["floorAreaMin"],
      });
    }
    if (
      data.lotSqftMin != null &&
      data.lotSqftMax != null &&
      data.lotSqftMin > data.lotSqftMax
    ) {
      ctx.addIssue({
        code: "custom",
        message: "lotSqftMin must be less than or equal to lotSqftMax",
        path: ["lotSqftMin"],
      });
    }
  });

export type ListPropertiesQuery = z.infer<typeof listPropertiesQuerySchema>;
