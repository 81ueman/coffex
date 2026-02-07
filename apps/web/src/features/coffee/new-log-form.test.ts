import { describe, expect, it } from "vitest";

import { initialNewLogFormValues, validateAndBuildPayload } from "@/features/coffee/new-log-form";

describe("validateAndBuildPayload", () => {
  it("returns required field errors when form is empty", () => {
    const result = validateAndBuildPayload(initialNewLogFormValues);

    expect(result.payload).toBeUndefined();
    expect(result.errors.beanName).toBe("豆名は必須です。");
    expect(result.errors.beanAmountG).toBe("豆量は1〜100gで入力してください。");
    expect(result.errors.waterAmountMl).toBe("湯量は50〜1000mlで入力してください。");
    expect(result.errors.brewTimeSec).toBe("時間は30〜900秒で入力してください。");
    expect(result.errors.waterTempC).toBe("温度は70〜100℃で入力してください。");
    expect(result.errors.extractionStepErrors?.[0]?.pourAmountG).toBe(
      "Step 1 の注湯量は1〜1000gで入力してください。",
    );
    expect(result.errors.extractionStepErrors?.[0]?.waitSec).toBe(
      "Step 1 の待機時間は0〜900秒で入力してください。",
    );
  });

  it("returns range errors for invalid numeric fields", () => {
    const result = validateAndBuildPayload({
      ...initialNewLogFormValues,
      beanName: "Valid Name",
      daysSinceRoast: "400",
      beanAmountG: "0",
      waterAmountMl: "49",
      brewTimeSec: "901",
      waterTempC: "101",
      tasteScore: "-1",
      extractionSteps: [{ pourAmountG: "1001", waitSec: "901" }],
    });

    expect(result.payload).toBeUndefined();
    expect(result.errors.daysSinceRoast).toBe("焙煎後日数は0〜365で入力してください。");
    expect(result.errors.beanAmountG).toBe("豆量は1〜100gで入力してください。");
    expect(result.errors.waterAmountMl).toBe("湯量は50〜1000mlで入力してください。");
    expect(result.errors.brewTimeSec).toBe("時間は30〜900秒で入力してください。");
    expect(result.errors.waterTempC).toBe("温度は70〜100℃で入力してください。");
    expect(result.errors.tasteScore).toBe("点数は0〜100で入力してください。");
    expect(result.errors.extractionStepErrors?.[0]?.pourAmountG).toBe(
      "Step 1 の注湯量は1〜1000gで入力してください。",
    );
    expect(result.errors.extractionStepErrors?.[0]?.waitSec).toBe(
      "Step 1 の待機時間は0〜900秒で入力してください。",
    );
  });

  it("builds a valid payload and trims text fields", () => {
    const result = validateAndBuildPayload({
      ...initialNewLogFormValues,
      beanName: "  Ethiopia Guji  ",
      origin: "  Ethiopia  ",
      roastMemo: "  roast  ",
      daysSinceRoast: "7",
      beanAmountG: "18",
      waterAmountMl: "300",
      brewTimeSec: "165",
      waterTempC: "91",
      extractionSteps: [
        { pourAmountG: "120", waitSec: "45" },
        { pourAmountG: "180", waitSec: "120" },
      ],
      grindMemo: "  middle-fine  ",
      tasteScore: "86",
      tasteMemo: "  甘みが強い  ",
    });

    expect(result.errors).toEqual({});
    expect(result.payload).toEqual({
      beanName: "Ethiopia Guji",
      origin: "Ethiopia",
      roastLevel: "中煎り",
      roastMemo: "roast",
      daysSinceRoast: 7,
      brewMethod: "V60",
      beanAmountG: 18,
      waterAmountMl: 300,
      brewTimeSec: 165,
      waterTempC: 91,
      extractionSteps: [
        { pourAmountG: 120, waitSec: 45 },
        { pourAmountG: 180, waitSec: 120 },
      ],
      grindMemo: "middle-fine",
      tasteScore: 86,
      tasteMemo: "甘みが強い",
    });
  });

  it("returns error when extraction pour total does not match water amount", () => {
    const result = validateAndBuildPayload({
      ...initialNewLogFormValues,
      beanName: "Valid Name",
      beanAmountG: "18",
      waterAmountMl: "300",
      brewTimeSec: "165",
      waterTempC: "91",
      tasteScore: "86",
      extractionSteps: [
        { pourAmountG: "100", waitSec: "45" },
        { pourAmountG: "180", waitSec: "60" },
      ],
    });

    expect(result.payload).toBeUndefined();
    expect(result.errors.extractionSteps).toBe("抽出手順の注湯量合計は湯量(ml)と一致させてください。");
  });

  it("returns error when extraction wait total exceeds brew time", () => {
    const result = validateAndBuildPayload({
      ...initialNewLogFormValues,
      beanName: "Valid Name",
      beanAmountG: "18",
      waterAmountMl: "300",
      brewTimeSec: "160",
      waterTempC: "91",
      tasteScore: "86",
      extractionSteps: [
        { pourAmountG: "150", waitSec: "100" },
        { pourAmountG: "150", waitSec: "80" },
      ],
    });

    expect(result.payload).toBeUndefined();
    expect(result.errors.extractionSteps).toBe("抽出手順の待機時間合計は抽出時間(秒)以下にしてください。");
  });
});
