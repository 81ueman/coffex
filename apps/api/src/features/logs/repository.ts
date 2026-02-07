import type { CoffeeLog, CoffeeLogInput, ListLogsQuery } from "@coffex/shared/coffee";
import { count, desc, eq } from "drizzle-orm";

import { coffeeLogs } from "../../db/schema";
import type { DbClient } from "../../db/client";
import { buildWhereClause, rowToCoffeeLog } from "./query-helpers";

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
      extractionSteps: JSON.stringify(nextLog.extractionSteps),
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
