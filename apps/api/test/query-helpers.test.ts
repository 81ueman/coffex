import { describe, expect, it } from "vitest";

import { buildWhereClause, rowToCoffeeLog } from "../src/features/logs/query-helpers";

describe("query helpers", () => {
  it("returns undefined when query has no filter conditions", () => {
    const where = buildWhereClause({
      beanQuery: "   ",
      limit: 10,
      offset: 0,
    });

    expect(where).toBeUndefined();
  });

  it("builds a where clause when at least one condition exists", () => {
    const where = buildWhereClause({
      beanQuery: "  Ethiopia  ",
      roastLevel: "中煎り",
      brewMethod: "V60",
      startDate: "2026-01-01",
      endDate: "2026-01-31",
      limit: 10,
      offset: 0,
    });

    expect(where).toBeDefined();
  });

  it("maps db row into a CoffeeLog shape", () => {
    const mapped = rowToCoffeeLog({
      id: "11111111-1111-4111-8111-111111111111",
      recordedAt: "2026-01-01T01:02:03.000Z",
      beanName: "Kenya AA",
      origin: "Kenya",
      roastLevel: "中煎り",
      roastMemo: "memo",
      daysSinceRoast: 3,
      brewMethod: "V60",
      beanAmountG: 15,
      waterAmountMl: 240,
      brewTimeSec: 180,
      waterTempC: 92,
      extractionSteps: '[{"pourAmountG":120,"waitSec":45},{"pourAmountG":120,"waitSec":135}]',
      grindMemo: "middle-fine",
      tasteScore: 88,
      tasteMemo: "sweet",
    });

    expect(mapped).toEqual({
      id: "11111111-1111-4111-8111-111111111111",
      recordedAt: "2026-01-01T01:02:03.000Z",
      beanName: "Kenya AA",
      origin: "Kenya",
      roastLevel: "中煎り",
      roastMemo: "memo",
      daysSinceRoast: 3,
      brewMethod: "V60",
      beanAmountG: 15,
      waterAmountMl: 240,
      brewTimeSec: 180,
      waterTempC: 92,
      extractionSteps: [
        { pourAmountG: 120, waitSec: 45 },
        { pourAmountG: 120, waitSec: 135 },
      ],
      grindMemo: "middle-fine",
      tasteScore: 88,
      tasteMemo: "sweet",
    });
  });

  it("falls back to single-step extraction when persisted steps are empty", () => {
    const mapped = rowToCoffeeLog({
      id: "22222222-2222-4222-8222-222222222222",
      recordedAt: "2026-01-01T01:02:03.000Z",
      beanName: "Colombia",
      origin: "Colombia",
      roastLevel: "中煎り",
      roastMemo: "",
      daysSinceRoast: null,
      brewMethod: "V60",
      beanAmountG: 15,
      waterAmountMl: 250,
      brewTimeSec: 170,
      waterTempC: 91,
      extractionSteps: "[]",
      grindMemo: "",
      tasteScore: 80,
      tasteMemo: "",
    });

    expect(mapped.extractionSteps).toEqual([{ pourAmountG: 250, waitSec: 170 }]);
  });

  it("falls back to single-step extraction when persisted steps are invalid JSON", () => {
    const mapped = rowToCoffeeLog({
      id: "33333333-3333-4333-8333-333333333333",
      recordedAt: "2026-01-01T01:02:03.000Z",
      beanName: "Brazil",
      origin: "Brazil",
      roastLevel: "中煎り",
      roastMemo: "",
      daysSinceRoast: null,
      brewMethod: "V60",
      beanAmountG: 15,
      waterAmountMl: 220,
      brewTimeSec: 160,
      waterTempC: 91,
      extractionSteps: "{not-json}",
      grindMemo: "",
      tasteScore: 80,
      tasteMemo: "",
    });

    expect(mapped.extractionSteps).toEqual([{ pourAmountG: 220, waitSec: 160 }]);
  });
});
