export const ROAST_LEVELS = [
  "浅煎り",
  "中煎り",
  "中深入り",
  "深入り",
] as const;

export const BREW_METHODS = [
  "V60",
  "HARIO スイッチ",
  "Kalita",
  "French Press",
  "Aeropress",
  "Espresso",
  "Other",
] as const;

export type RoastLevel = (typeof ROAST_LEVELS)[number];
export type BrewMethod = (typeof BREW_METHODS)[number];

export type CoffeeLogInput = {
  beanName: string;
  origin: string;
  roastLevel: RoastLevel;
  roastMemo: string;
  daysSinceRoast: number | null;
  brewMethod: BrewMethod;
  beanAmountG: number;
  waterAmountMl: number;
  brewTimeSec: number;
  waterTempC: number;
  grindMemo: string;
  tasteScore: number;
  tasteMemo: string;
};

export type CoffeeLog = CoffeeLogInput & {
  id: string;
  recordedAt: string;
};
