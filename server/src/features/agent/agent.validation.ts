import { z } from "zod";

export const createAgentSchema = z.object({
  name: z.string().min(1, "name is required"),
  email: z.email("email must be valid"),
  phone: z.string().min(1).optional(),
});

export type CreateAgentPayload = z.infer<typeof createAgentSchema>;
