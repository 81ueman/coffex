import { describe, expect, it } from "vitest";

import type { CoffeeLog } from "@/features/coffee/types";
import { calculateKpis, filterLogs } from "@/features/coffee/dashboard-logic";

function createLog(overrides?: Partial<CoffeeLog>): CoffeeLog {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    recordedAt: "2026-01-10T00:00:00.000Z",
    beanName: "Ethiopia Guji",
    origin: "Ethiopia",
    roastLevel: "中煎り",
    roastMemo: "",
    daysSinceRoast: 3,
    brewMethod: "V60",
    beanAmountG: 15,
    waterAmountMl: 240,
    brewTimeSec: 180,
    waterTempC: 92,
    extractionSteps: [{ pourAmountG: 240, waitSec: 180 }],
    grindMemo: "",
    tasteScore: 84,
    tasteMemo: "",
    ...overrides,
  };
}

describe("filterLogs", () => {
  it("applies AND filtering across beanQuery, roastLevel, brewMethod and dates", () => {
    const logs = [
      createLog({
        id: "11111111-1111-4111-8111-111111111111",
        beanName: "Kenya AA",
        roastLevel: "中煎り",
        brewMethod: "V60",
        recordedAt: "2026-01-10T00:00:00.000Z",
      }),
      createLog({
        id: "22222222-2222-4222-8222-222222222222",
        beanName: "Kenya AB",
        roastLevel: "深入り",
        brewMethod: "V60",
        recordedAt: "2026-01-12T00:00:00.000Z",
      }),
      createLog({
        id: "33333333-3333-4333-8333-333333333333",
        beanName: "Ethiopia Guji",
        roastLevel: "中煎り",
        brewMethod: "Espresso",
        recordedAt: "2026-01-12T00:00:00.000Z",
      }),
    ];

    const filtered = filterLogs(logs, {
      beanQuery: "kenya",
      roastLevel: "中煎り",
      brewMethod: "V60",
      startDate: "2026-01-01",
      endDate: "2026-01-31",
    });

    expect(filtered.map((log) => log.beanName)).toEqual(["Kenya AA"]);
  });

  it("matches bean query case-insensitively and trims query", () => {
    const logs = [createLog({ beanName: "ETHIOPIA WASHED" }), createLog({ beanName: "Kenya AA" })];
    const filtered = filterLogs(logs, {
      beanQuery: "  ethiopia  ",
      roastLevel: "all",
      brewMethod: "all",
      startDate: "",
      endDate: "",
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.beanName).toBe("ETHIOPIA WASHED");
  });
});

describe("calculateKpis", () => {
  it("returns zeroed metrics for empty logs", () => {
    expect(calculateKpis([], new Date("2026-01-15T00:00:00.000Z").getTime())).toEqual({
      total: 0,
      averageScore: 0,
      last7Days: 0,
      bestScore: 0,
    });
  });

  it("calculates average, best and recent counts", () => {
    const now = new Date("2026-01-15T00:00:00.000Z").getTime();
    const logs = [
      createLog({ tasteScore: 70, recordedAt: "2026-01-14T00:00:00.000Z" }),
      createLog({ id: "22222222-2222-4222-8222-222222222222", tasteScore: 90, recordedAt: "2026-01-10T00:00:00.000Z" }),
      createLog({ id: "33333333-3333-4333-8333-333333333333", tasteScore: 80, recordedAt: "2025-12-30T00:00:00.000Z" }),
    ];

    expect(calculateKpis(logs, now)).toEqual({
      total: 3,
      averageScore: 80,
      last7Days: 2,
      bestScore: 90,
    });
  });
});
