import type { NextFunction, Request, Response } from "express";
import { listPropertiesQuerySchema } from "../property/property.list-query";
import { PropertyService } from "../property/property.service";

export class AdminPropertyController {
  constructor(private readonly service: PropertyService) {}

  list = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const parsed = listPropertiesQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      next(parsed.error);
      return;
    }
    const q = parsed.data;
    const { items, total } = await this.service.listPropertiesPaginated(q, {
      includeInternalNotes: true,
    });
    req.response = {
      statusCode: 200,
      data: { items, total, page: q.page, limit: q.limit },
    };
    next();
  };

  getById = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const property = await this.service.getPropertyById(req.params.id as string, {
      includeInternalNotes: true,
    });

    if (!property) {
      req.response = { statusCode: 404, message: "Property not found" };
    } else {
      req.response = { statusCode: 200, data: property };
    }

    next();
  };
}
