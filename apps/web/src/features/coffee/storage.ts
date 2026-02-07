import type { CoffeeLog, CoffeeLogInput } from "@/features/coffee/types";

const STORAGE_KEY = "coffex.logs";

function canUseStorage() {
  return typeof window !== "undefined";
}

function sortByNewest(logs: Array<CoffeeLog>) {
  return [...logs].sort(
    (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
  );
}

export function loadLogs(): Array<CoffeeLog> {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as Array<CoffeeLog>;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return sortByNewest(parsed);
  } catch {
    return [];
  }
}

export function saveLogs(logs: Array<CoffeeLog>) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sortByNewest(logs)));
}

export function createLog(input: CoffeeLogInput): CoffeeLog {
  return {
    ...input,
    id: crypto.randomUUID(),
    recordedAt: new Date().toISOString(),
  };
}

export function addLog(input: CoffeeLogInput): CoffeeLog {
  const nextLog = createLog(input);
  const logs = loadLogs();

  saveLogs([nextLog, ...logs]);

  return nextLog;
}

export function deleteLog(id: string) {
  const logs = loadLogs();
  saveLogs(logs.filter((log) => log.id !== id));
}
