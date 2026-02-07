import type { CoffeeLogInput } from "@coffex/shared/coffee";
import { afterEach, describe, expect, it } from "vitest";

import { createApp } from "../src/app";
import { createDbClient } from "../src/db/client";
import { CoffeeLogsRepository } from "../src/features/logs/repository";

function createPayload(overrides?: Partial<CoffeeLogInput>): CoffeeLogInput {
  return {
    beanName: "Ethiopia Guji",
    origin: "Ethiopia",
    roastLevel: "中煎り",
    roastMemo: "balanced roast",
    daysSinceRoast: 7,
    brewMethod: "V60",
    beanAmountG: 15,
    waterAmountMl: 240,
    brewTimeSec: 180,
    waterTempC: 92,
    grindMemo: "middle-fine",
    tasteScore: 84,
    tasteMemo: "citrus and floral",
    ...overrides,
  };
}

describe("coffee logs API", () => {
  const resources: Array<{ close: () => void }> = [];

  afterEach(() => {
    while (resources.length > 0) {
      const item = resources.pop();
      item?.close();
    }
  });

  function setup() {
    const { db, sqlite } = createDbClient(":memory:");
    resources.push({ close: () => sqlite.close() });

    const repository = new CoffeeLogsRepository(db);
    const app = createApp({ repository });

    return app;
  }

  it("creates and lists logs", async () => {
    const app = setup();

    const createResponse = await app.request(
      "/api/logs",
      new Request("http://localhost/api/logs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(createPayload()),
      }),
    );

    expect(createResponse.status).toBe(201);
    const created = (await createResponse.json()) as { id: string };
    expect(created.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );

    const listResponse = await app.request("/api/logs?limit=10&offset=0");
    expect(listResponse.status).toBe(200);

    const list = (await listResponse.json()) as { total: number; items: Array<{ beanName: string }> };
    expect(list.total).toBe(1);
    expect(list.items).toHaveLength(1);
    expect(list.items[0]?.beanName).toBe("Ethiopia Guji");
  });

  it("filters and deletes logs", async () => {
    const app = setup();

    const firstCreate = await app.request(
      "/api/logs",
      new Request("http://localhost/api/logs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(createPayload({ roastLevel: "中煎り", beanName: "A" })),
      }),
    );
    const firstCreated = (await firstCreate.json()) as { id: string };

    await app.request(
      "/api/logs",
      new Request("http://localhost/api/logs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(createPayload({ roastLevel: "深入り", beanName: "B" })),
      }),
    );

    const filteredResponse = await app.request(
      "/api/logs?roastLevel=%E4%B8%AD%E7%85%8E%E3%82%8A&limit=10&offset=0",
    );
    const filtered = (await filteredResponse.json()) as { total: number; items: Array<{ beanName: string }> };

    expect(filtered.total).toBe(1);
    expect(filtered.items[0]?.beanName).toBe("A");

    const deleteResponse = await app.request(
      `/api/logs/${firstCreated.id}`,
      new Request(`http://localhost/api/logs/${firstCreated.id}`, {
        method: "DELETE",
      }),
    );

    expect(deleteResponse.status).toBe(200);
    const deleted = (await deleteResponse.json()) as { success: boolean };
    expect(deleted.success).toBe(true);
  });

  it("returns health response", async () => {
    const app = setup();

    const response = await app.request("/api/health");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
  });

  it("rejects invalid payload", async () => {
    const app = setup();
    const invalidPayload = {
      ...createPayload(),
      beanName: "   ",
      tasteScore: 101,
    };

    const response = await app.request(
      "/api/logs",
      new Request("http://localhost/api/logs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(invalidPayload),
      }),
    );

    expect(response.status).toBe(400);
  });

  it("rejects invalid query", async () => {
    const app = setup();

    const response = await app.request("/api/logs?limit=1000&offset=-1");
    expect(response.status).toBe(400);
  });

  it("uses default query parameters for list logs", async () => {
    const app = setup();

    await app.request(
      "/api/logs",
      new Request("http://localhost/api/logs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(createPayload({ beanName: "Default Query Target" })),
      }),
    );

    const response = await app.request("/api/logs");
    expect(response.status).toBe(200);

    const payload = (await response.json()) as { items: Array<{ beanName: string }>; total: number };
    expect(payload.total).toBe(1);
    expect(payload.items[0]?.beanName).toBe("Default Query Target");
  });

  it("rejects invalid delete param", async () => {
    const app = setup();

    const response = await app.request(
      "/api/logs/not-a-uuid",
      new Request("http://localhost/api/logs/not-a-uuid", { method: "DELETE" }),
    );

    expect(response.status).toBe(400);
  });
});
