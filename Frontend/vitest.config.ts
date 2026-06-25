import { defineConfig } from "vitest/config"
import tsconfigPaths from "vite-tsconfig-paths"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "happy-dom",
    environmentOptions: {
      happyDOM: {
        url: "http://localhost",
      },
    },
    globals: true,
    testTimeout: 10000,
    hookTimeout: 10000,
    setupFiles: ["./app/test/setup.ts"],
    include: ["app/**/*.test.{ts,tsx}"],
    coverage: {
      reporter: ["lcov", "text-summary"],
      include: ["app/**/*.{ts,tsx}"],
      exclude: ["app/components/ui/**", "app/test/**"],
    },
  },
})
