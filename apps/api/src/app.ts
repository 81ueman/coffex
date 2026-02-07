import {
  coffeeLogInputSchema,
  listLogsQuerySchema,
  listLogsResponseSchema,
} from "@coffex/shared/coffee";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { z } from "zod";

import { CoffeeLogsRepository } from "./features/logs/repository";

const deleteLogParamsSchema = z.object({ id: z.string().uuid() });

type AppDependencies = {
  repository: CoffeeLogsRepository;
};

export function createApp(deps: AppDependencies) {
  const app = new Hono();
  app.use("/api/*", cors());

  app.get("/api/health", (c) => {
    return c.json({ ok: true });
  });

  app.get("/api/logs", zValidator("query", listLogsQuerySchema), async (c) => {
    const query = c.req.valid("query");
    const result = await deps.repository.list(query);

    return c.json(listLogsResponseSchema.parse(result));
  });

  app.post("/api/logs", zValidator("json", coffeeLogInputSchema), async (c) => {
    const payload = c.req.valid("json");
    const created = await deps.repository.create(payload);

    return c.json(created, 201);
  });

  app.delete("/api/logs/:id", zValidator("param", deleteLogParamsSchema), async (c) => {
    const { id } = c.req.valid("param");
    const result = await deps.repository.delete(id);

    return c.json(result);
  });

  return app;
}

export type AppType = ReturnType<typeof createApp>;
