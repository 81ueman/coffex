import { serve } from "@hono/node-server";

import { createDbClient } from "./db/client";
import { CoffeeLogsRepository } from "./features/logs/repository";
import { createApp } from "./app";

const databasePath = process.env.DATABASE_URL ?? "./apps/api/data/coffex.db";
const { db } = createDbClient(databasePath);
const repository = new CoffeeLogsRepository(db);
const app = createApp({ repository });

const port = Number(process.env.PORT ?? 8787);

serve({
  fetch: app.fetch,
  port,
});

console.log(`API server started on http://127.0.0.1:${port}`);
