import type { NextFunction, Request, Response } from "express";
import { AgentService } from "./agent.service";
import { createAgentSchema } from "./agent.validation";

export class AgentController {
  constructor(private readonly service: AgentService) {}

  list = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const agents = await this.service.listAgents();
    req.response = { statusCode: 200, data: agents };
    next();
  };

  getById = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const agent = await this.service.getAgentById(req.params.id as string);

    if (!agent) {
      req.response = { statusCode: 404, message: "Agent not found" };
    } else {
      req.response = { statusCode: 200, data: agent };
    }

    next();
  };

  create = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const payload = createAgentSchema.parse(req.body);
    const agent = await this.service.createAgent(payload);
    req.response = { statusCode: 201, data: agent };
    next();
  };
}
