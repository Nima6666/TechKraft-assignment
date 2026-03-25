import { prisma } from "../../shared/prisma";
import type { CreateAgentPayload } from "./agent.validation";

export class AgentRepo {
  constructor(private readonly db = prisma) {}

  async create(payload: CreateAgentPayload) {
    return this.db.agent.create({
      data: {
        name: payload.name,
        email: payload.email,
        phone: payload.phone ?? null,
      },
    });
  }

  async getById(id: string) {
    return this.db.agent.findUnique({
      where: { id },
    });
  }

  async getAll() {
    return this.db.agent.findMany({
      orderBy: { createdAt: "desc" },
    });
  }
}
