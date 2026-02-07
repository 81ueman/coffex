import { Link, createFileRoute } from "@tanstack/react-router";
import { EyeIcon, Trash2Icon } from "lucide-react";
import { useMemo, useState } from "react";
import type { BrewMethod, RoastLevel } from "@/features/coffee/types";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BREW_METHODS,
  ROAST_LEVELS,
} from "@/features/coffee/types";
import { calculateKpis, filterLogs } from "@/features/coffee/dashboard-logic";
import { useCoffeeLogs } from "@/features/coffee/use-coffee-logs";

export const Route = createFileRoute("/")({ component: DashboardPage });

const dateTimeFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

function DashboardPage() {
  const { logs, isHydrated, deleteLogRecord } = useCoffeeLogs();

  const [beanQuery, setBeanQuery] = useState("");
  const [roastLevel, setRoastLevel] = useState<RoastLevel | "all">("all");
  const [brewMethod, setBrewMethod] = useState<BrewMethod | "all">("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredLogs = useMemo(() => {
    return filterLogs(logs, {
      beanQuery,
      roastLevel,
      brewMethod,
      startDate,
      endDate,
    });
  }, [beanQuery, brewMethod, endDate, logs, roastLevel, startDate]);

  const kpis = useMemo(() => calculateKpis(logs), [logs]);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Coffex 記録ダッシュボード</h1>
          <p className="text-muted-foreground text-sm">
            抽出条件と味スコアを記録し、後から比較できるモックアップ
          </p>
        </div>
        <Button asChild>
          <Link to="/new">新規記録を追加</Link>
        </Button>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="総記録数" value={`${kpis.total}件`} />
        <KpiCard label="平均点" value={`${kpis.averageScore.toFixed(1)}点`} />
        <KpiCard label="直近7日" value={`${kpis.last7Days}件`} />
        <KpiCard label="最高点" value={`${kpis.bestScore}点`} />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>絞り込み</CardTitle>
          <CardDescription>豆名・焙煎度・抽出方法・日付で絞り込めます</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            <Field>
              <FieldLabel htmlFor="bean-query">豆名検索</FieldLabel>
              <Input
                id="bean-query"
                value={beanQuery}
                onChange={(event) => setBeanQuery(event.target.value)}
                placeholder="例: Ethiopia Guji"
              />
            </Field>

            <Field>
              <FieldLabel>焙煎度</FieldLabel>
              <Select value={roastLevel} onValueChange={setRoastLevel}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="すべて" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  {ROAST_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>抽出方法</FieldLabel>
              <Select value={brewMethod} onValueChange={setBrewMethod}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="すべて" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  {BREW_METHODS.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="start-date">開始日</FieldLabel>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="end-date">終了日</FieldLabel>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>記録一覧</CardTitle>
          <CardDescription>
            {isHydrated
              ? `表示中: ${filteredLogs.length}件 / 全${logs.length}件`
              : "保存済みデータを読み込み中..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>記録日</TableHead>
                <TableHead>豆名</TableHead>
                <TableHead>焙煎度</TableHead>
                <TableHead>焙煎後日数</TableHead>
                <TableHead>抽出方法</TableHead>
                <TableHead>豆量</TableHead>
                <TableHead>湯量</TableHead>
                <TableHead>時間</TableHead>
                <TableHead>温度</TableHead>
                <TableHead>点数</TableHead>
                <TableHead>メモ</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-muted-foreground py-8 text-center">
                    まだ記録がありません。新規記録を追加してください。
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{dateTimeFormatter.format(new Date(log.recordedAt))}</TableCell>
                    <TableCell className="font-medium">{log.beanName}</TableCell>
                    <TableCell>{log.roastLevel}</TableCell>
                    <TableCell>{log.daysSinceRoast === null ? "-" : `${log.daysSinceRoast}日`}</TableCell>
                    <TableCell>{log.brewMethod}</TableCell>
                    <TableCell>{log.beanAmountG}g</TableCell>
                    <TableCell>{log.waterAmountMl}ml</TableCell>
                    <TableCell>{log.brewTimeSec}秒</TableCell>
                    <TableCell>{log.waterTempC}℃</TableCell>
                    <TableCell>
                      <ScoreBadge score={log.tasteScore} />
                    </TableCell>
                    <TableCell>
                      {log.roastMemo || log.grindMemo || log.tasteMemo ? (
                        <Badge variant="outline">あり</Badge>
                      ) : (
                        <Badge variant="secondary">なし</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link
                            to="/logs/$logId"
                            params={{ logId: log.id }}
                            state={{ log }}
                          >
                            <EyeIcon />
                            詳細
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2Icon />
                              削除
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>記録を削除しますか？</AlertDialogTitle>
                              <AlertDialogDescription>
                                この操作は元に戻せません。豆名「{log.beanName}」の記録を削除します。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>キャンセル</AlertDialogCancel>
                              <AlertDialogAction onClick={() => void deleteLogRecord(log.id)}>
                                削除する
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle>{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

function ScoreBadge({ score }: { score: number }) {
  if (score >= 85) {
    return <Badge>{score}点</Badge>;
  }

  if (score >= 70) {
    return <Badge variant="secondary">{score}点</Badge>;
  }

  return <Badge variant="outline">{score}点</Badge>;
}
