import { useCallback, useEffect, useState } from "react";

import type { CoffeeLog, CoffeeLogInput } from "@/features/coffee/types";
import { apiClient } from "@/lib/api-client";

export function useCoffeeLogs() {
  const [logs, setLogs] = useState<Array<CoffeeLog>>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const load = async () => {
      try {
        const response = await apiClient.api.logs.$get({
          query: {
            limit: 100,
            offset: 0,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch logs");
        }

        const payload = await response.json();

        if (!isCancelled) {
          setLogs(payload.items);
        }
      } finally {
        if (!isCancelled) {
          setIsHydrated(true);
        }
      }
    };

    void load();

    return () => {
      isCancelled = true;
    };
  }, []);

  const addLogRecord = useCallback(async (input: CoffeeLogInput) => {
    const response = await apiClient.api.logs.$post({ json: input });

    if (!response.ok) {
      throw new Error("Failed to create log");
    }

    const nextLog = await response.json();

    setLogs((current) => [nextLog, ...current]);

    return nextLog;
  }, []);

  const deleteLogRecord = useCallback(async (id: string) => {
    const response = await apiClient.api.logs[":id"].$delete({
      param: { id },
    });

    if (!response.ok) {
      throw new Error("Failed to delete log");
    }

    const payload = await response.json();

    if (payload.success) {
      setLogs((current) => current.filter((log) => log.id !== id));
    }
  }, []);

  return {
    logs,
    isHydrated,
    addLogRecord,
    deleteLogRecord,
  };
}
