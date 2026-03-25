import cors from "cors";
import express from "express";
import { env } from "../config/env";
import { agentRouter } from "./features/agent/agent.routes";
import { adminPropertyRouter } from "./features/admin/admin.property.route";
import { propertyRouter } from "./features/property/property.routes";
import { responseHandler } from "./shared/middlewares/response-handler.middleware";
import { errorHandler } from "./shared/middlewares/error-handler.middleware";

const app = express();

app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "x-header-isadmin"],
  })
);
app.use(express.json());

const baseRoute = "/api/v1";

// public routes
app.use(`${baseRoute}/agents`, agentRouter);
app.use(`${baseRoute}/properties`, propertyRouter);

// admin routes
app.use(`${baseRoute}/admin/properties`, adminPropertyRouter);

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.use(responseHandler);
app.use(errorHandler);

export { app };
