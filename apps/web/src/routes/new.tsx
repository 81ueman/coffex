import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  BREW_METHODS,
  ROAST_LEVELS,
  type BrewMethod,
  type CoffeeLogInput,
  type RoastLevel,
} from "@/features/coffee/types";
import { useCoffeeLogs } from "@/features/coffee/use-coffee-logs";

export const Route = createFileRoute("/new")({ component: NewLogPage });

type FormValues = {
  beanName: string;
  origin: string;
  roastLevel: RoastLevel;
  roastMemo: string;
  daysSinceRoast: string;
  brewMethod: BrewMethod;
  beanAmountG: string;
  waterAmountMl: string;
  brewTimeSec: string;
  waterTempC: string;
  grindMemo: string;
  tasteScore: string;
  tasteMemo: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = {
  beanName: "",
  origin: "",
  roastLevel: "中煎り",
  roastMemo: "",
  daysSinceRoast: "",
  brewMethod: "V60",
  beanAmountG: "",
  waterAmountMl: "",
  brewTimeSec: "",
  waterTempC: "",
  grindMemo: "",
  tasteScore: "",
  tasteMemo: "",
};

function NewLogPage() {
  const navigate = useNavigate();
  const { addLogRecord } = useCoffeeLogs();

  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: FormErrors = {};

    if (!values.beanName.trim()) {
      nextErrors.beanName = "豆名は必須です。";
    }

    let daysSinceRoast: number | null = null;
    if (values.daysSinceRoast.trim() !== "") {
      const parsedDaysSinceRoast = Number(values.daysSinceRoast);
      if (
        !Number.isFinite(parsedDaysSinceRoast) ||
        parsedDaysSinceRoast < 0 ||
        parsedDaysSinceRoast > 365
      ) {
        nextErrors.daysSinceRoast = "焙煎後日数は0〜365で入力してください。";
      } else {
        daysSinceRoast = parsedDaysSinceRoast;
      }
    }

    const waterAmountMl = Number(values.waterAmountMl);
    if (!Number.isFinite(waterAmountMl) || waterAmountMl < 50 || waterAmountMl > 1000) {
      nextErrors.waterAmountMl = "湯量は50〜1000mlで入力してください。";
    }

    const brewTimeSec = Number(values.brewTimeSec);
    if (!Number.isFinite(brewTimeSec) || brewTimeSec < 30 || brewTimeSec > 900) {
      nextErrors.brewTimeSec = "時間は30〜900秒で入力してください。";
    }

    const waterTempC = Number(values.waterTempC);
    if (!Number.isFinite(waterTempC) || waterTempC < 70 || waterTempC > 100) {
      nextErrors.waterTempC = "温度は70〜100℃で入力してください。";
    }

    const tasteScore = Number(values.tasteScore);
    if (!Number.isFinite(tasteScore) || tasteScore < 0 || tasteScore > 100) {
      nextErrors.tasteScore = "点数は0〜100で入力してください。";
    }

    const beanAmountG = Number(values.beanAmountG);
    if (!Number.isFinite(beanAmountG) || beanAmountG < 1 || beanAmountG > 100) {
      nextErrors.beanAmountG = "豆量は1〜100gで入力してください。";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const payload: CoffeeLogInput = {
      beanName: values.beanName.trim(),
      origin: values.origin.trim(),
      roastLevel: values.roastLevel,
      roastMemo: values.roastMemo.trim(),
      daysSinceRoast,
      brewMethod: values.brewMethod,
      beanAmountG,
      waterAmountMl,
      brewTimeSec,
      waterTempC,
      grindMemo: values.grindMemo.trim(),
      tasteScore,
      tasteMemo: values.tasteMemo.trim(),
    };

    await addLogRecord(payload);
    navigate({ to: "/" });
  };

  const updateValue = <T extends keyof FormValues>(key: T, value: FormValues[T]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 md:px-8">
      <Card>
        <CardHeader>
          <CardTitle>新規記録</CardTitle>
          <CardDescription>抽出条件と味の点数を入力します</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={onSubmit}>
            <FieldGroup className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="beanName">豆名 *</FieldLabel>
                <Input
                  id="beanName"
                  value={values.beanName}
                  onChange={(event) => updateValue("beanName", event.target.value)}
                />
                <FieldError>{errors.beanName}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="origin">産地</FieldLabel>
                <Input
                  id="origin"
                  value={values.origin}
                  onChange={(event) => updateValue("origin", event.target.value)}
                  placeholder="例: Ethiopia"
                />
              </Field>

              <Field>
                <FieldLabel>焙煎度 *</FieldLabel>
                <Select
                  value={values.roastLevel}
                  onValueChange={(value) => updateValue("roastLevel", value as RoastLevel)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROAST_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="daysSinceRoast">焙煎後日数</FieldLabel>
                <Input
                  id="daysSinceRoast"
                  type="number"
                  min={0}
                  max={365}
                  value={values.daysSinceRoast}
                  onChange={(event) => updateValue("daysSinceRoast", event.target.value)}
                  placeholder="不明なら空欄"
                />
                <FieldError>{errors.daysSinceRoast}</FieldError>
              </Field>

              <Field>
                <FieldLabel>抽出方法 *</FieldLabel>
                <Select
                  value={values.brewMethod}
                  onValueChange={(value) => updateValue("brewMethod", value as BrewMethod)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BREW_METHODS.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="beanAmountG">豆量(g) *</FieldLabel>
                <Input
                  id="beanAmountG"
                  type="number"
                  min={1}
                  max={100}
                  value={values.beanAmountG}
                  onChange={(event) => updateValue("beanAmountG", event.target.value)}
                />
                <FieldError>{errors.beanAmountG}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="waterAmountMl">湯量(ml) *</FieldLabel>
                <Input
                  id="waterAmountMl"
                  type="number"
                  min={50}
                  max={1000}
                  value={values.waterAmountMl}
                  onChange={(event) => updateValue("waterAmountMl", event.target.value)}
                />
                <FieldError>{errors.waterAmountMl}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="brewTimeSec">抽出時間(秒) *</FieldLabel>
                <Input
                  id="brewTimeSec"
                  type="number"
                  min={30}
                  max={900}
                  value={values.brewTimeSec}
                  onChange={(event) => updateValue("brewTimeSec", event.target.value)}
                />
                <FieldError>{errors.brewTimeSec}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="waterTempC">温度(℃) *</FieldLabel>
                <Input
                  id="waterTempC"
                  type="number"
                  min={70}
                  max={100}
                  value={values.waterTempC}
                  onChange={(event) => updateValue("waterTempC", event.target.value)}
                />
                <FieldError>{errors.waterTempC}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="tasteScore">味の点数(0-100) *</FieldLabel>
                <Input
                  id="tasteScore"
                  type="number"
                  min={0}
                  max={100}
                  value={values.tasteScore}
                  onChange={(event) => updateValue("tasteScore", event.target.value)}
                />
                <FieldError>{errors.tasteScore}</FieldError>
              </Field>
            </FieldGroup>

            <FieldGroup className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="roastMemo">焙煎メモ</FieldLabel>
                <Textarea
                  id="roastMemo"
                  value={values.roastMemo}
                  onChange={(event) => updateValue("roastMemo", event.target.value)}
                  placeholder="焙煎の印象や補足"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="grindMemo">挽き目メモ</FieldLabel>
                <Textarea
                  id="grindMemo"
                  value={values.grindMemo}
                  onChange={(event) => updateValue("grindMemo", event.target.value)}
                  placeholder="例: 中細挽き"
                />
              </Field>
            </FieldGroup>

            <Field>
              <FieldLabel htmlFor="tasteMemo">味メモ</FieldLabel>
              <Textarea
                id="tasteMemo"
                value={values.tasteMemo}
                onChange={(event) => updateValue("tasteMemo", event.target.value)}
                placeholder="酸味、甘み、後味など"
              />
            </Field>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" asChild>
                <Link to="/">キャンセル</Link>
              </Button>
              <Button type="submit">保存する</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
