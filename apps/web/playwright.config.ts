import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  webServer: [
    {
      command:
        "rm -f /tmp/coffex-e2e.db && DATABASE_URL=/tmp/coffex-e2e.db PORT=8787 pnpm --filter @coffex/api dev",
      url: "http://127.0.0.1:8787/api/health",
      cwd: "../..",
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
    {
      command:
        "VITE_API_BASE_URL=http://127.0.0.1:8787 pnpm --filter @coffex/web build && VITE_API_BASE_URL=http://127.0.0.1:8787 pnpm --filter @coffex/web preview --host 127.0.0.1 --port 3000",
      url: "http://127.0.0.1:3000",
      cwd: "../..",
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
  ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
