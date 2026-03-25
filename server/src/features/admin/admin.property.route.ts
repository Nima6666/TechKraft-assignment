import { Router } from "express";
import { AdminPropertyController } from "./admin.property.controller";
import { PropertyService } from "../property/property.service";
import { PropertyRepo } from "../property/property.repo";
import { requireAdmin } from "../auth/auth.middleware";

class AdminPropertyRoutes {
  private readonly router: Router;

  constructor(
    private readonly controller: AdminPropertyController,
    router: Router = Router()
  ) {
    this.router = router;
    this.router.use(requireAdmin);
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.get("/", this.controller.list);
    this.router.get("/:id", this.controller.getById);
  }

  getRouter(): Router {
    return this.router;
  }
}

const adminPropertyRepo = new PropertyRepo();
const adminPropertyService = new PropertyService(adminPropertyRepo);
const adminPropertyController = new AdminPropertyController(adminPropertyService);
const adminPropertyRouter = new AdminPropertyRoutes(
  adminPropertyController
).getRouter();

export { adminPropertyRouter };
