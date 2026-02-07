import { expect, test } from "@playwright/test";

async function createLog(
  page: import("@playwright/test").Page,
  beanName: string,
  options?: { roastLevel?: string; brewMethod?: string; tasteScore?: string },
) {
  await page.goto("/new");

  await page.getByLabel("豆名").fill(beanName);
  await page.getByLabel("産地").fill("Ethiopia");

  if (options?.roastLevel && options.roastLevel !== "中煎り") {
    await page.getByRole("combobox").nth(0).click();
    await page.getByRole("option", { name: options.roastLevel, exact: true }).click();
  }

  if (options?.brewMethod && options.brewMethod !== "V60") {
    await page.getByRole("combobox").nth(1).click();
    await page.getByRole("option", { name: options.brewMethod }).click();
  }

  await page.getByLabel("焙煎後日数").fill("3");
  await page.getByLabel("豆量(g)").fill("18");
  await page.getByLabel("湯量(ml)").fill("300");
  await page.getByLabel("抽出時間(秒)").fill("165");
  await page.getByLabel("温度(℃)").fill("91");
  await page.getByLabel("味の点数(0-100)").fill(options?.tasteScore ?? "86");
  await page.getByLabel("味メモ").fill("甘みが強く、後味が良い");

  await page.getByRole("button", { name: "保存する" }).click();
  await expect(page).toHaveURL("/");
}

test.beforeEach(async ({ page, request }) => {
  const response = await request.get("http://127.0.0.1:8787/api/logs?limit=100&offset=0");
  const payload = (await response.json()) as { items: Array<{ id: string }> };

  for (const item of payload.items) {
    await request.delete(`http://127.0.0.1:8787/api/logs/${item.id}`);
  }

  await page.goto("/");
});

test("新規作成した記録が一覧に表示される", async ({ page }) => {
  const beanName = `PW-CREATE-${Date.now()}`;

  await createLog(page, beanName);

  await expect(page.getByRole("cell", { name: beanName })).toBeVisible();
  await expect(page.getByRole("cell", { name: "86点" })).toBeVisible();
});

test("記録を削除できる", async ({ page }) => {
  const beanName = `PW-DELETE-${Date.now()}`;

  await createLog(page, beanName);

  const row = page.locator("tr", { hasText: beanName });
  await expect(row).toBeVisible();

  await row.getByRole("button", { name: "削除" }).click();
  await page.getByRole("button", { name: "削除する" }).click();

  await expect(page.getByRole("cell", { name: beanName })).toHaveCount(0);
});

test("リロードしても記録が保持される", async ({ page }) => {
  const beanName = `PW-PERSIST-${Date.now()}`;

  await createLog(page, beanName);
  await page.reload();

  await expect(page.getByRole("cell", { name: beanName })).toBeVisible();
});

test("新規作成フォームで必須・範囲バリデーションが表示される", async ({ page }) => {
  await page.goto("/new");

  await page.getByRole("button", { name: "保存する" }).click();

  await expect(page.getByText("豆名は必須です。")).toBeVisible();
  await expect(page.getByText("湯量は50〜1000mlで入力してください。")).toBeVisible();
  await expect(page.getByText("時間は30〜900秒で入力してください。")).toBeVisible();
  await expect(page.getByText("温度は70〜100℃で入力してください。")).toBeVisible();
});

test("絞り込み条件で表示件数が変わる", async ({ page }) => {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  const today = `${yyyy}-${mm}-${dd}`;

  await createLog(page, `PW-FILTER-A-${Date.now()}`, {
    roastLevel: "中煎り",
    brewMethod: "V60",
  });
  await createLog(page, `PW-FILTER-B-${Date.now()}`, {
    roastLevel: "深入り",
    brewMethod: "Espresso",
  });

  await page.goto("/");
  await expect(page.getByText("表示中: 2件 / 全2件")).toBeVisible();

  await page.getByLabel("豆名検索").fill("FILTER-A");
  await expect(page.getByText("表示中: 1件 / 全2件")).toBeVisible();

  await page.getByRole("combobox").nth(0).click();
  await page.getByRole("option", { name: "中煎り" }).click();
  await expect(page.getByText("表示中: 1件 / 全2件")).toBeVisible();

  await page.getByRole("combobox").nth(1).click();
  await page.getByRole("option", { name: "V60" }).click();
  await expect(page.getByText("表示中: 1件 / 全2件")).toBeVisible();

  await page.getByLabel("豆名検索").fill("");
  await expect(page.getByText("表示中: 1件 / 全2件")).toBeVisible();

  await page.getByLabel("開始日").fill(today);
  await page.getByLabel("終了日").fill(today);
  await expect(page.getByText("表示中: 1件 / 全2件")).toBeVisible();
});

test("削除ダイアログでキャンセルすると記録は残る", async ({ page }) => {
  const beanName = `PW-CANCEL-${Date.now()}`;

  await createLog(page, beanName);
  const row = page.locator("tr", { hasText: beanName });
  await expect(row).toBeVisible();

  await row.getByRole("button", { name: "削除" }).click();
  await page.getByRole("button", { name: "キャンセル" }).click();

  await expect(page.getByRole("cell", { name: beanName })).toBeVisible();
});
