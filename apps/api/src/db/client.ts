import fs from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import * as schema from "./schema";

export type DbClient = ReturnType<typeof drizzle<typeof schema>>;

export function openSqliteDatabase(filePath: string) {
  if (filePath !== ":memory:") {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }

  const sqlite = new Database(filePath);

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS coffee_logs (
      id TEXT PRIMARY KEY NOT NULL,
      recorded_at TEXT NOT NULL,
      bean_name TEXT NOT NULL,
      origin TEXT NOT NULL DEFAULT '',
      roast_level TEXT NOT NULL,
      roast_memo TEXT NOT NULL DEFAULT '',
      days_since_roast INTEGER,
      brew_method TEXT NOT NULL,
      bean_amount_g INTEGER NOT NULL,
      water_amount_ml INTEGER NOT NULL,
      brew_time_sec INTEGER NOT NULL,
      water_temp_c INTEGER NOT NULL,
      extraction_steps TEXT NOT NULL DEFAULT '[]',
      grind_memo TEXT NOT NULL DEFAULT '',
      taste_score INTEGER NOT NULL,
      taste_memo TEXT NOT NULL DEFAULT ''
    );

    CREATE INDEX IF NOT EXISTS coffee_logs_recorded_at_idx ON coffee_logs(recorded_at);
    CREATE INDEX IF NOT EXISTS coffee_logs_roast_level_idx ON coffee_logs(roast_level);
    CREATE INDEX IF NOT EXISTS coffee_logs_brew_method_idx ON coffee_logs(brew_method);
  `);

  try {
    sqlite.exec("ALTER TABLE coffee_logs ADD COLUMN extraction_steps TEXT NOT NULL DEFAULT '[]'");
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes("duplicate column name")) {
      throw error;
    }
  }

  sqlite.exec(`
    UPDATE coffee_logs
    SET extraction_steps = (
      '[{"pourAmountG":' || water_amount_ml || ',"waitSec":' || brew_time_sec || '}]'
    )
    WHERE extraction_steps IS NULL
      OR trim(extraction_steps) = ''
      OR extraction_steps = '[]';
  `);

  return sqlite;
}

export function createDbClient(filePath: string) {
  const sqlite = openSqliteDatabase(filePath);
  const db = drizzle(sqlite, { schema });

  return { sqlite, db };
}
