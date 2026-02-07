import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "jsdom",
    exclude: ["e2e/**", "node_modules/**", ".output/**"],
    coverage: {
      provider: "v8",
      include: [
        "src/features/coffee/dashboard-logic.ts",
        "src/features/coffee/new-log-form.ts",
        "src/features/coffee/use-coffee-logs.ts",
      ],
      thresholds: {
        statements: 75,
        functions: 75,
        lines: 75,
        branches: 65,
      },
    },
  },
});
