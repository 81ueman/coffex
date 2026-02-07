import type { BrewMethod, CoffeeLogInput, RoastLevel } from "@/features/coffee/types";

export type NewLogFormValues = {
  beanName: string;
  origin: string;
  roastLevel: RoastLevel;
  roastMemo: string;
  daysSinceRoast: string;
  brewMethod: BrewMethod;
  beanAmountG: string;
  waterAmountMl: string;
  brewTimeSec: string;
  waterTempC: string;
  grindMemo: string;
  tasteScore: string;
  tasteMemo: string;
};

export type NewLogFormErrors = Partial<Record<keyof NewLogFormValues, string>>;

export const initialNewLogFormValues: NewLogFormValues = {
  beanName: "",
  origin: "",
  roastLevel: "中煎り",
  roastMemo: "",
  daysSinceRoast: "",
  brewMethod: "V60",
  beanAmountG: "",
  waterAmountMl: "",
  brewTimeSec: "",
  waterTempC: "",
  grindMemo: "",
  tasteScore: "",
  tasteMemo: "",
};

export function validateAndBuildPayload(values: NewLogFormValues): {
  errors: NewLogFormErrors;
  payload?: CoffeeLogInput;
} {
  const errors: NewLogFormErrors = {};

  if (!values.beanName.trim()) {
    errors.beanName = "豆名は必須です。";
  }

  let daysSinceRoast: number | null = null;
  if (values.daysSinceRoast.trim() !== "") {
    const parsedDaysSinceRoast = Number(values.daysSinceRoast);
    if (!Number.isFinite(parsedDaysSinceRoast) || parsedDaysSinceRoast < 0 || parsedDaysSinceRoast > 365) {
      errors.daysSinceRoast = "焙煎後日数は0〜365で入力してください。";
    } else {
      daysSinceRoast = parsedDaysSinceRoast;
    }
  }

  const waterAmountMl = Number(values.waterAmountMl);
  if (!Number.isFinite(waterAmountMl) || waterAmountMl < 50 || waterAmountMl > 1000) {
    errors.waterAmountMl = "湯量は50〜1000mlで入力してください。";
  }

  const brewTimeSec = Number(values.brewTimeSec);
  if (!Number.isFinite(brewTimeSec) || brewTimeSec < 30 || brewTimeSec > 900) {
    errors.brewTimeSec = "時間は30〜900秒で入力してください。";
  }

  const waterTempC = Number(values.waterTempC);
  if (!Number.isFinite(waterTempC) || waterTempC < 70 || waterTempC > 100) {
    errors.waterTempC = "温度は70〜100℃で入力してください。";
  }

  const tasteScore = Number(values.tasteScore);
  if (!Number.isFinite(tasteScore) || tasteScore < 0 || tasteScore > 100) {
    errors.tasteScore = "点数は0〜100で入力してください。";
  }

  const beanAmountG = Number(values.beanAmountG);
  if (!Number.isFinite(beanAmountG) || beanAmountG < 1 || beanAmountG > 100) {
    errors.beanAmountG = "豆量は1〜100gで入力してください。";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  return {
    errors: {},
    payload: {
      beanName: values.beanName.trim(),
      origin: values.origin.trim(),
      roastLevel: values.roastLevel,
      roastMemo: values.roastMemo.trim(),
      daysSinceRoast,
      brewMethod: values.brewMethod,
      beanAmountG,
      waterAmountMl,
      brewTimeSec,
      waterTempC,
      grindMemo: values.grindMemo.trim(),
      tasteScore,
      tasteMemo: values.tasteMemo.trim(),
    },
  };
}
