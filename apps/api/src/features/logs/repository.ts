import type { CoffeeLog, CoffeeLogInput, ListLogsQuery } from "@coffex/shared/coffee";
import { and, count, desc, eq, gte, like, lte, sql } from "drizzle-orm";

import { coffeeLogs } from "../../db/schema";
import type { DbClient } from "../../db/client";

function rowToCoffeeLog(row: typeof coffeeLogs.$inferSelect): CoffeeLog {
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
    grindMemo: row.grindMemo,
    tasteScore: row.tasteScore,
    tasteMemo: row.tasteMemo,
  };
}

function buildWhereClause(query: ListLogsQuery) {
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

export class CoffeeLogsRepository {
  constructor(private readonly db: DbClient) {}

  async list(query: ListLogsQuery) {
    const whereClause = buildWhereClause(query);

    const items = await this.db
      .select()
      .from(coffeeLogs)
      .where(whereClause)
      .orderBy(desc(coffeeLogs.recordedAt))
      .limit(query.limit)
      .offset(query.offset);

    const [totalRow] = await this.db
      .select({ value: count() })
      .from(coffeeLogs)
      .where(whereClause);

    return {
      items: items.map(rowToCoffeeLog),
      total: totalRow?.value ?? 0,
    };
  }

  async create(input: CoffeeLogInput): Promise<CoffeeLog> {
    const nextLog: CoffeeLog = {
      ...input,
      id: crypto.randomUUID(),
      recordedAt: new Date().toISOString(),
    };

    await this.db.insert(coffeeLogs).values({
      id: nextLog.id,
      recordedAt: nextLog.recordedAt,
      beanName: nextLog.beanName,
      origin: nextLog.origin,
      roastLevel: nextLog.roastLevel,
      roastMemo: nextLog.roastMemo,
      daysSinceRoast: nextLog.daysSinceRoast,
      brewMethod: nextLog.brewMethod,
      beanAmountG: nextLog.beanAmountG,
      waterAmountMl: nextLog.waterAmountMl,
      brewTimeSec: nextLog.brewTimeSec,
      waterTempC: nextLog.waterTempC,
      grindMemo: nextLog.grindMemo,
      tasteScore: nextLog.tasteScore,
      tasteMemo: nextLog.tasteMemo,
    });

    return nextLog;
  }

  async delete(id: string) {
    const result = await this.db.delete(coffeeLogs).where(eq(coffeeLogs.id, id));

    return {
      success: result.changes > 0,
    };
  }
}
