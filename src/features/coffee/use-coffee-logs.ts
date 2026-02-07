import { useCallback, useEffect, useState } from "react";

import { addLog, deleteLog, loadLogs } from "@/features/coffee/storage";
import type { CoffeeLog, CoffeeLogInput } from "@/features/coffee/types";

export function useCoffeeLogs() {
  const [logs, setLogs] = useState<CoffeeLog[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setLogs(loadLogs());
    setIsHydrated(true);
  }, []);

  const addLogRecord = useCallback((input: CoffeeLogInput) => {
    const nextLog = addLog(input);
    setLogs((current) => [nextLog, ...current]);

    return nextLog;
  }, []);

  const deleteLogRecord = useCallback((id: string) => {
    deleteLog(id);
    setLogs((current) => current.filter((log) => log.id !== id));
  }, []);

  return {
    logs,
    isHydrated,
    addLogRecord,
    deleteLogRecord,
  };
}
