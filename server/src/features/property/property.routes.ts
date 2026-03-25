import { Router } from "express";
import { PropertyController } from "./property.controller";
import { PropertyService } from "./property.service";
import { PropertyRepo } from "./property.repo";

class PropertyRoutes {
  private readonly router: Router;

  constructor(
    private readonly controller: PropertyController,
    router: Router = Router()
  ) {
    this.router = router;
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.get("/", this.controller.list);
    this.router.get("/:id", this.controller.getById);
    this.router.post("/", this.controller.create);
  }

  getRouter(): Router {
    return this.router;
  }
}

const propertyRepo = new PropertyRepo();
const propertyService = new PropertyService(propertyRepo);
const propertyController = new PropertyController(propertyService);
const propertyRouter = new PropertyRoutes(propertyController).getRouter();

export { propertyRouter };
