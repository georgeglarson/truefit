import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@server": path.resolve(__dirname, "src/server"),
      "@client": path.resolve(__dirname, "src/client"),
    },
  },
  test: {
    globals: true,
    include: [
      "src/server/**/__tests__/**/*.test.ts",
      "src/client/**/__tests__/**/*.test.tsx",
    ],
    setupFiles: ["src/client/__tests__/setup.ts"],
  },
});
