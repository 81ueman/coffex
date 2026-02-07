import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const coffeeLogs = sqliteTable(
  "coffee_logs",
  {
    id: text("id").primaryKey(),
    recordedAt: text("recorded_at").notNull(),
    beanName: text("bean_name").notNull(),
    origin: text("origin").notNull().default(""),
    roastLevel: text("roast_level").notNull(),
    roastMemo: text("roast_memo").notNull().default(""),
    daysSinceRoast: integer("days_since_roast"),
    brewMethod: text("brew_method").notNull(),
    beanAmountG: integer("bean_amount_g").notNull(),
    waterAmountMl: integer("water_amount_ml").notNull(),
    brewTimeSec: integer("brew_time_sec").notNull(),
    waterTempC: integer("water_temp_c").notNull(),
    grindMemo: text("grind_memo").notNull().default(""),
    tasteScore: integer("taste_score").notNull(),
    tasteMemo: text("taste_memo").notNull().default(""),
  },
  (table) => [
    index("coffee_logs_recorded_at_idx").on(table.recordedAt),
    index("coffee_logs_roast_level_idx").on(table.roastLevel),
    index("coffee_logs_brew_method_idx").on(table.brewMethod),
  ],
);
