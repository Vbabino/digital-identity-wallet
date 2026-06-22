import { reactRouter } from "@react-router/dev/vite"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

// Dev-mode CSP: unsafe-inline and unsafe-eval are required by Vite HMR and
// Tailwind v4's style injection. They would be removed for production (nonce-based).
const DEV_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  // ws:// needed for Vite's HMR WebSocket; wss:// for HTTPS dev setups
  "connect-src 'self' ws://localhost:5173 wss://localhost:5173",
  "img-src 'self' data:",
  "font-src 'self'",
  // form-action must be explicit — it does not fall back to default-src
  "form-action 'self'",
  // frame-ancestors replaces X-Frame-Options in modern browsers
  "frame-ancestors 'none'",
].join("; ")

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
    headers: {
      "Content-Security-Policy": DEV_CSP,
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
  },
})
