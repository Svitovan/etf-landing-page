import { defineConfig } from "vitest/config";

export default defineConfig({
  oxc: { jsx: { runtime: "classic" } },
  test: { include: ["tests/**/*.test.ts"] },
});
