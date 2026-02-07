import { expect, test } from "@playwright/test";

async function createLog(page: import("@playwright/test").Page, beanName: string) {
  await page.goto("/new");

  await page.getByLabel("豆名").fill(beanName);
  await page.getByLabel("産地").fill("Ethiopia");
  await page.getByLabel("焙煎後日数").fill("3");
  await page.getByLabel("豆量(g)").fill("18");
  await page.getByLabel("湯量(ml)").fill("300");
  await page.getByLabel("抽出時間(秒)").fill("165");
  await page.getByLabel("温度(℃)").fill("91");
  await page.getByLabel("味の点数(0-100)").fill("86");
  await page.getByLabel("味メモ").fill("甘みが強く、後味が良い");

  await page.getByRole("button", { name: "保存する" }).click();
  await expect(page).toHaveURL("/");
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
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
