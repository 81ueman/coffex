import type { CoffeeLogInput } from "@coffex/shared/coffee";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
    extractionSteps: [{ pourAmountG: 240, waitSec: 180 }],
    grindMemo: "middle-fine",
    tasteScore: 84,
    tasteMemo: "citrus and floral",
    ...overrides,
  };
}

describe("CoffeeLogsRepository", () => {
  let sqlite: ReturnType<typeof createDbClient>["sqlite"];
  let repository: CoffeeLogsRepository;

  beforeEach(() => {
    const client = createDbClient(":memory:");
    sqlite = client.sqlite;
    repository = new CoffeeLogsRepository(client.db);
  });

  afterEach(() => {
    vi.useRealTimers();
    sqlite?.close();
  });

  it("creates a log with generated id and recordedAt, then persists it", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-01T10:20:30.000Z"));

    const created = await repository.create(createPayload({ beanName: "Create Target" }));
    expect(created.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(created.recordedAt).toBe("2026-02-01T10:20:30.000Z");

    const listed = await repository.list({ limit: 10, offset: 0, beanQuery: "Target" });
    expect(listed.total).toBe(1);
    expect(listed.items[0]?.beanName).toBe("Create Target");
    expect(listed.items[0]?.extractionSteps).toEqual([{ pourAmountG: 240, waitSec: 180 }]);
  });

  it("supports filter combinations and keeps total aligned with filtered rows", async () => {
    await repository.create(
      createPayload({
        beanName: "Alpha Kenya",
        roastLevel: "中煎り",
        brewMethod: "V60",
      }),
    );
    await repository.create(
      createPayload({
        beanName: "Beta Colombia",
        roastLevel: "深入り",
        brewMethod: "Espresso",
      }),
    );
    await repository.create(
      createPayload({
        beanName: "Gamma Ethiopia",
        roastLevel: "中煎り",
        brewMethod: "V60",
      }),
    );

    const filtered = await repository.list({
      beanQuery: "a",
      roastLevel: "中煎り",
      brewMethod: "V60",
      limit: 10,
      offset: 0,
    });

    expect(filtered.total).toBe(2);
    expect(filtered.items.map((item) => item.beanName).sort()).toEqual(["Alpha Kenya", "Gamma Ethiopia"]);
  });

  it("filters by startDate and endDate boundaries inclusively", async () => {
    vi.useFakeTimers();

    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
    await repository.create(createPayload({ beanName: "B1" }));

    vi.setSystemTime(new Date("2026-01-15T00:00:00.000Z"));
    await repository.create(createPayload({ beanName: "B2" }));

    vi.setSystemTime(new Date("2026-02-01T00:00:00.000Z"));
    await repository.create(createPayload({ beanName: "B3" }));

    const january = await repository.list({
      startDate: "2026-01-01",
      endDate: "2026-01-31",
      limit: 20,
      offset: 0,
    });

    expect(january.total).toBe(2);
    expect(january.items.map((item) => item.beanName)).toEqual(["B2", "B1"]);
  });

  it("supports pagination with limit and offset", async () => {
    await repository.create(createPayload({ beanName: "One" }));
    await repository.create(createPayload({ beanName: "Two" }));
    await repository.create(createPayload({ beanName: "Three" }));

    const paged = await repository.list({ limit: 1, offset: 1 });
    expect(paged.total).toBe(3);
    expect(paged.items).toHaveLength(1);
    expect(paged.items[0]?.beanName).toBe("Two");
  });

  it("returns success false when deleting a non-existing id", async () => {
    const result = await repository.delete("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
    expect(result).toEqual({ success: false });
  });
});
