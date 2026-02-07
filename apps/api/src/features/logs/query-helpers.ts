import { extractionStepsSchema, type CoffeeLog, type ListLogsQuery } from "@coffex/shared/coffee";
import { and, eq, gte, like, lte, sql } from "drizzle-orm";

import { coffeeLogs } from "../../db/schema";

function parseExtractionSteps(
  serialized: string,
  fallback: { pourAmountG: number; waitSec: number },
): CoffeeLog["extractionSteps"] {
  try {
    const parsed = JSON.parse(serialized) as unknown;
    const result = extractionStepsSchema.safeParse(parsed);
    if (result.success) {
      return result.data;
    }
  } catch {
    // no-op, fallback below
  }

  return [fallback];
}

export function rowToCoffeeLog(row: typeof coffeeLogs.$inferSelect): CoffeeLog {
  return {
    id: row.id,
    recordedAt: row.recordedAt,
    beanName: row.beanName,
    origin: row.origin,
    roastLevel: row.roastLevel as CoffeeLog["roastLevel"],
    roastMemo: row.roastMemo,
    daysSinceRoast: row.daysSinceRoast,
    brewMethod: row.brewMethod as CoffeeLog["brewMethod"],
    beanAmountG: row.beanAmountG,
    waterAmountMl: row.waterAmountMl,
    brewTimeSec: row.brewTimeSec,
    waterTempC: row.waterTempC,
    extractionSteps: parseExtractionSteps(row.extractionSteps, {
      pourAmountG: row.waterAmountMl,
      waitSec: row.brewTimeSec,
    }),
    grindMemo: row.grindMemo,
    tasteScore: row.tasteScore,
    tasteMemo: row.tasteMemo,
  };
}

export function buildWhereClause(query: ListLogsQuery) {
  const conditions = [];

  if (query.beanQuery && query.beanQuery.trim() !== "") {
    conditions.push(like(coffeeLogs.beanName, `%${query.beanQuery.trim()}%`));
  }

  if (query.roastLevel) {
    conditions.push(eq(coffeeLogs.roastLevel, query.roastLevel));
  }

  if (query.brewMethod) {
    conditions.push(eq(coffeeLogs.brewMethod, query.brewMethod));
  }

  if (query.startDate) {
    conditions.push(gte(sql`date(${coffeeLogs.recordedAt})`, query.startDate));
  }

  if (query.endDate) {
    conditions.push(lte(sql`date(${coffeeLogs.recordedAt})`, query.endDate));
  }

  if (conditions.length === 0) {
    return undefined;
  }

  return and(...conditions);
}
