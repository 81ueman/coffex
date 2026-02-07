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
    });

    expect(result.payload).toBeUndefined();
    expect(result.errors.daysSinceRoast).toBe("焙煎後日数は0〜365で入力してください。");
    expect(result.errors.beanAmountG).toBe("豆量は1〜100gで入力してください。");
    expect(result.errors.waterAmountMl).toBe("湯量は50〜1000mlで入力してください。");
    expect(result.errors.brewTimeSec).toBe("時間は30〜900秒で入力してください。");
    expect(result.errors.waterTempC).toBe("温度は70〜100℃で入力してください。");
    expect(result.errors.tasteScore).toBe("点数は0〜100で入力してください。");
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
      grindMemo: "middle-fine",
      tasteScore: 86,
      tasteMemo: "甘みが強い",
    });
  });
});
