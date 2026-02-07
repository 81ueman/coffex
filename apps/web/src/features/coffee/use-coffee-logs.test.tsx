import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { useCoffeeLogs as UseCoffeeLogsType } from "@/features/coffee/use-coffee-logs";

const { getLogsMock, createLogMock, deleteLogMock } = vi.hoisted(() => ({
  getLogsMock: vi.fn(),
  createLogMock: vi.fn(),
  deleteLogMock: vi.fn(),
}));

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    api: {
      logs: Object.assign(
        {
          $get: getLogsMock,
          $post: createLogMock,
        },
        {
          ":id": {
            $delete: deleteLogMock,
          },
        },
      ),
    },
  },
}));

let useCoffeeLogs: typeof UseCoffeeLogsType;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("useCoffeeLogs", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    ({ useCoffeeLogs } = await import("@/features/coffee/use-coffee-logs"));
  });

  it("loads logs on mount and hydrates state", async () => {
    getLogsMock.mockResolvedValue(
      jsonResponse({
        items: [
          {
            id: "11111111-1111-4111-8111-111111111111",
            recordedAt: "2026-01-10T00:00:00.000Z",
            beanName: "Load Target",
            origin: "Ethiopia",
            roastLevel: "中煎り",
            roastMemo: "",
            daysSinceRoast: 3,
            brewMethod: "V60",
            beanAmountG: 15,
            waterAmountMl: 240,
            brewTimeSec: 180,
            waterTempC: 92,
            grindMemo: "",
            tasteScore: 84,
            tasteMemo: "",
          },
        ],
        total: 1,
      }),
    );

    const { result } = renderHook(() => useCoffeeLogs());

    await waitFor(() => {
      expect(result.current.isHydrated).toBe(true);
    });
    expect(result.current.logs).toHaveLength(1);
    expect(result.current.logs[0]?.beanName).toBe("Load Target");
  });

  it("hydrates even when initial fetch fails", async () => {
    getLogsMock.mockResolvedValue(jsonResponse({ message: "failed" }, 500));

    const { result } = renderHook(() => useCoffeeLogs());

    await waitFor(() => {
      expect(result.current.isHydrated).toBe(true);
    });
    expect(result.current.logs).toEqual([]);
  });

  it("adds a newly created log to the beginning", async () => {
    getLogsMock.mockResolvedValue(jsonResponse({ items: [], total: 0 }));
    createLogMock.mockResolvedValue(
      jsonResponse({
        id: "11111111-1111-4111-8111-111111111111",
        recordedAt: "2026-01-10T00:00:00.000Z",
        beanName: "Created",
        origin: "",
        roastLevel: "中煎り",
        roastMemo: "",
        daysSinceRoast: null,
        brewMethod: "V60",
        beanAmountG: 15,
        waterAmountMl: 240,
        brewTimeSec: 180,
        waterTempC: 92,
        grindMemo: "",
        tasteScore: 84,
        tasteMemo: "",
      }),
    );

    const { result } = renderHook(() => useCoffeeLogs());
    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    await act(async () => {
      await result.current.addLogRecord({
        beanName: "Created",
        origin: "",
        roastLevel: "中煎り",
        roastMemo: "",
        daysSinceRoast: null,
        brewMethod: "V60",
        beanAmountG: 15,
        waterAmountMl: 240,
        brewTimeSec: 180,
        waterTempC: 92,
        grindMemo: "",
        tasteScore: 84,
        tasteMemo: "",
      });
    });

    expect(result.current.logs).toHaveLength(1);
    expect(result.current.logs[0]?.beanName).toBe("Created");
  });

  it("removes a log from state after successful delete", async () => {
    getLogsMock.mockResolvedValue(
      jsonResponse({
        items: [
          {
            id: "11111111-1111-4111-8111-111111111111",
            recordedAt: "2026-01-10T00:00:00.000Z",
            beanName: "Delete Me",
            origin: "",
            roastLevel: "中煎り",
            roastMemo: "",
            daysSinceRoast: null,
            brewMethod: "V60",
            beanAmountG: 15,
            waterAmountMl: 240,
            brewTimeSec: 180,
            waterTempC: 92,
            grindMemo: "",
            tasteScore: 84,
            tasteMemo: "",
          },
          {
            id: "22222222-2222-4222-8222-222222222222",
            recordedAt: "2026-01-09T00:00:00.000Z",
            beanName: "Keep Me",
            origin: "",
            roastLevel: "中煎り",
            roastMemo: "",
            daysSinceRoast: null,
            brewMethod: "V60",
            beanAmountG: 15,
            waterAmountMl: 240,
            brewTimeSec: 180,
            waterTempC: 92,
            grindMemo: "",
            tasteScore: 84,
            tasteMemo: "",
          },
        ],
        total: 2,
      }),
    );
    deleteLogMock.mockResolvedValue(jsonResponse({ success: true }));

    const { result } = renderHook(() => useCoffeeLogs());
    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    await act(async () => {
      await result.current.deleteLogRecord("11111111-1111-4111-8111-111111111111");
    });

    expect(result.current.logs).toHaveLength(1);
    expect(result.current.logs[0]?.beanName).toBe("Keep Me");
  });
});
