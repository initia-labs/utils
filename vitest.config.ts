import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text"],
      exclude: ["dist", "*.config.*", "src/index.ts"],
    },
  },
});
