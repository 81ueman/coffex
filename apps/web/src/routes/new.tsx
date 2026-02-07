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
  type RoastLevel,
} from "@/features/coffee/types";
import {
  initialNewLogFormValues,
  type NewLogFormErrors,
  type NewLogFormValues,
  validateAndBuildPayload,
} from "@/features/coffee/new-log-form";
import { useCoffeeLogs } from "@/features/coffee/use-coffee-logs";

export const Route = createFileRoute("/new")({ component: NewLogPage });

function NewLogPage() {
  const navigate = useNavigate();
  const { addLogRecord } = useCoffeeLogs();

  const [values, setValues] = useState<NewLogFormValues>(initialNewLogFormValues);
  const [errors, setErrors] = useState<NewLogFormErrors>({});

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = validateAndBuildPayload(values);
    if (Object.keys(result.errors).length > 0 || !result.payload) {
      setErrors(result.errors);
      return;
    }

    await addLogRecord(result.payload);
    navigate({ to: "/" });
  };

  const updateValue = <T extends keyof NewLogFormValues>(key: T, value: NewLogFormValues[T]) => {
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
