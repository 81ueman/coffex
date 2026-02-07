import type { CoffeeLog, BrewMethod, RoastLevel } from "@/features/coffee/types";

export type DashboardFilters = {
  beanQuery: string;
  roastLevel: RoastLevel | "all";
  brewMethod: BrewMethod | "all";
  startDate: string;
  endDate: string;
};

export function filterLogs(logs: CoffeeLog[], filters: DashboardFilters): CoffeeLog[] {
  return logs.filter((log) => {
    const date = log.recordedAt.slice(0, 10);

    if (
      filters.beanQuery.trim().length > 0 &&
      !log.beanName.toLowerCase().includes(filters.beanQuery.trim().toLowerCase())
    ) {
      return false;
    }

    if (filters.roastLevel !== "all" && log.roastLevel !== filters.roastLevel) {
      return false;
    }

    if (filters.brewMethod !== "all" && log.brewMethod !== filters.brewMethod) {
      return false;
    }

    if (filters.startDate && date < filters.startDate) {
      return false;
    }

    if (filters.endDate && date > filters.endDate) {
      return false;
    }

    return true;
  });
}

export function calculateKpis(logs: CoffeeLog[], now = Date.now()) {
  const total = logs.length;
  const averageScore = total === 0 ? 0 : logs.reduce((sum, log) => sum + log.tasteScore, 0) / total;
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const last7Days = logs.filter((log) => new Date(log.recordedAt).getTime() >= sevenDaysAgo).length;
  const bestScore = total === 0 ? 0 : logs.reduce((best, log) => Math.max(best, log.tasteScore), 0);

  return {
    total,
    averageScore,
    last7Days,
    bestScore,
  };
}
