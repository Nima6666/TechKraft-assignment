import { Router } from "express";
import { AgentController } from "./agent.controller";
import { AgentService } from "./agent.service";
import { AgentRepo } from "./agent.repo";

class AgentRoutes {
  private readonly router: Router;

  constructor(
    private readonly controller: AgentController,
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

const agentRepo = new AgentRepo();
const agentService = new AgentService(agentRepo);
const agentController = new AgentController(agentService);
const agentRouter = new AgentRoutes(agentController).getRouter();

export { agentRouter };
