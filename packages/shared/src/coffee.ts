import { z } from "zod";

export const ROAST_LEVELS = ["浅煎り", "中煎り", "中深入り", "深入り"] as const;
export const BREW_METHODS = [
  "V60",
  "HARIO スイッチ",
  "Kalita",
  "French Press",
  "Aeropress",
  "Espresso",
  "Other",
] as const;

export const roastLevelSchema = z.enum(ROAST_LEVELS);
export const brewMethodSchema = z.enum(BREW_METHODS);

export const coffeeLogInputSchema = z.object({
  beanName: z.string().trim().min(1),
  origin: z.string(),
  roastLevel: roastLevelSchema,
  roastMemo: z.string(),
  daysSinceRoast: z.number().int().min(0).max(365).nullable(),
  brewMethod: brewMethodSchema,
  beanAmountG: z.number().int().min(1).max(100),
  waterAmountMl: z.number().int().min(50).max(1000),
  brewTimeSec: z.number().int().min(30).max(900),
  waterTempC: z.number().int().min(70).max(100),
  grindMemo: z.string(),
  tasteScore: z.number().int().min(0).max(100),
  tasteMemo: z.string(),
});

export const coffeeLogSchema = coffeeLogInputSchema.extend({
  id: z.string().uuid(),
  recordedAt: z.string().datetime(),
});

export const listLogsQuerySchema = z.object({
  beanQuery: z.string().optional(),
  roastLevel: roastLevelSchema.optional(),
  brewMethod: brewMethodSchema.optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const listLogsResponseSchema = z.object({
  items: z.array(coffeeLogSchema),
  total: z.number().int().min(0),
});

export type RoastLevel = z.infer<typeof roastLevelSchema>;
export type BrewMethod = z.infer<typeof brewMethodSchema>;
export type CoffeeLogInput = z.infer<typeof coffeeLogInputSchema>;
export type CoffeeLog = z.infer<typeof coffeeLogSchema>;
export type ListLogsQuery = z.infer<typeof listLogsQuerySchema>;
export type ListLogsResponse = z.infer<typeof listLogsResponseSchema>;
