import { Link, createFileRoute, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { CoffeeLog } from "@/features/coffee/types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { apiClient } from "@/lib/api-client";

export const Route = createFileRoute("/logs/$logId")({ component: CoffeeLogDetailPage });

const dateTimeFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

type DetailState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "not-found" }
  | { status: "loaded"; log: CoffeeLog };

function CoffeeLogDetailPage() {
  const { logId } = Route.useParams();
  const preloadedLog = useRouterState({
    select: (state) => {
      const locationState = state.location.state as { log?: CoffeeLog } | undefined;

      if (locationState?.log?.id === logId) {
        return locationState.log;
      }

      return undefined;
    },
  });
  const [state, setState] = useState<DetailState>(() =>
    preloadedLog ? { status: "loaded", log: preloadedLog } : { status: "loading" },
  );

  useEffect(() => {
    let isCancelled = false;

    const load = async () => {
      try {
        for (let attempt = 0; attempt < 2; attempt += 1) {
          const response = await apiClient.api.logs[":id"].$get({
            param: { id: logId },
          });

          if (response.status === 404) {
            if (attempt === 0) {
              await new Promise((resolve) => setTimeout(resolve, 150));
              continue;
            }

            if (!isCancelled && !preloadedLog) {
              setState({ status: "not-found" });
            }
            return;
          }

          if (!response.ok) {
            throw new Error("Failed to fetch log");
          }

          const log = await response.json();

          if (!isCancelled) {
            setState({ status: "loaded", log });
          }
          return;
        }
      } catch {
        if (!isCancelled && !preloadedLog) {
          setState({ status: "error" });
        }
      }
    };

    if (!preloadedLog) {
      setState({ status: "loading" });
    }
    void load();

    return () => {
      isCancelled = true;
    };
  }, [logId, preloadedLog]);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6 md:px-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">記録詳細</h1>
        <Button variant="outline" asChild>
          <Link to="/">一覧に戻る</Link>
        </Button>
      </header>

      {state.status === "loading" && (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            記録を読み込み中...
          </CardContent>
        </Card>
      )}

      {state.status === "not-found" && (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            指定された記録は見つかりませんでした。
          </CardContent>
        </Card>
      )}

      {state.status === "error" && (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            記録の取得に失敗しました。時間をおいて再度お試しください。
          </CardContent>
        </Card>
      )}

      {state.status === "loaded" && <DetailCard log={state.log} />}
    </main>
  );
}

function DetailCard({ log }: { log: CoffeeLog }) {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <CardTitle className="flex flex-wrap items-center gap-2">
          <span>{log.beanName}</span>
          <Badge>{`${log.tasteScore}点`}</Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          記録日時: {dateTimeFormatter.format(new Date(log.recordedAt))}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <DetailRow label="産地" value={log.origin || "-"} />
        <DetailRow label="焙煎度" value={log.roastLevel} />
        <DetailRow
          label="焙煎後日数"
          value={log.daysSinceRoast === null ? "不明" : `${log.daysSinceRoast}日`}
        />
        <DetailRow label="抽出方法" value={log.brewMethod} />
        <DetailRow label="豆量" value={`${log.beanAmountG}g`} />
        <DetailRow label="湯量" value={`${log.waterAmountMl}ml`} />
        <DetailRow label="抽出時間" value={`${log.brewTimeSec}秒`} />
        <DetailRow label="温度" value={`${log.waterTempC}℃`} />

        <Separator />

        <DetailRow label="焙煎メモ" value={log.roastMemo || "-"} />
        <DetailRow label="挽き目メモ" value={log.grindMemo || "-"} />
        <DetailRow label="味メモ" value={log.tasteMemo || "-"} />
      </CardContent>
    </Card>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 md:grid-cols-[160px_1fr] md:gap-4">
      <div className="text-sm font-medium text-muted-foreground">{label}</div>
      <div className="text-sm break-words">{value}</div>
    </div>
  );
}
