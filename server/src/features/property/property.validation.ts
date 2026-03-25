import { z } from "zod";

const propertyTypeEnum = z.enum(["HOUSE", "LAND"]);
const areaUnitEnum = z.enum(["SQFT", "SQM", "ROPANI", "AANA", "BIGHA"]);

export const createPropertySchema = z
  .object({
    title: z.string().min(1, "title is required"),
    description: z.string().optional(),
    price: z.number().positive("price must be greater than 0"),
    propertyType: propertyTypeEnum,
    suburb: z.string().optional(),
    city: z.string().min(1, "city is required"),
    rooms: z.number().int().nonnegative().optional(),
    areaValue: z.number().positive().optional(),
    areaUnit: areaUnitEnum.optional(),
    floorArea: z.number().positive().optional(),
    internalNotes: z.string().optional(),
    agentId: z.string().min(1, "agentId is required"),
  })
  .superRefine((data, ctx) => {
    const isLand = data.propertyType === "LAND";

    if (data.propertyType === "HOUSE") {
      if (data.rooms == null) {
        ctx.addIssue({
          code: "custom",
          path: ["rooms"],
          message: "rooms is required for HOUSE",
        });
      }
    }

    if (isLand) {
      if (data.areaValue == null) {
        ctx.addIssue({
          code: "custom",
          path: ["areaValue"],
          message: "areaValue is required for LAND",
        });
      }
      if (data.areaUnit == null) {
        ctx.addIssue({
          code: "custom",
          path: ["areaUnit"],
          message: "areaUnit is required for LAND",
        });
      }
    }

    if ((data.areaValue == null) !== (data.areaUnit == null)) {
      ctx.addIssue({
        code: "custom",
        path: ["areaUnit"],
        message: "areaValue and areaUnit must be provided together",
      });
    }
  });

export type CreatePropertyPayload = z.infer<typeof createPropertySchema>;
