import type { CreateAgentPayload } from "./agent.validation";
import { AgentRepo } from "./agent.repo";

export class AgentService {
  constructor(private readonly repo: AgentRepo) {}

  async createAgent(payload: CreateAgentPayload) {
    return this.repo.create(payload);
  }

  async getAgentById(id: string) {
    return this.repo.getById(id);
  }

  async listAgents() {
    return this.repo.getAll();
  }
}
