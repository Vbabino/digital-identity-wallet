import { reactRouter } from "@react-router/dev/vite"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  server: {
    // Proxy all backend routes to localhost:8000 so that, from the browser's
    // perspective, every request is same-origin (localhost:5173).  This is the
    // correct way to avoid SameSite=Lax cookie issues that arise when the
    // frontend (localhost) and backend (127.0.0.1) are treated as different
    // sites by the browser's Public Suffix List.
    proxy: {
      "/api": { target: "http://localhost:8000", changeOrigin: true },
      "/o": { target: "http://localhost:8000", changeOrigin: true },
      "/accounts": { target: "http://localhost:8000", changeOrigin: true },
    },
  },
})
