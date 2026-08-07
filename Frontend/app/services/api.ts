import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios"

// baseURL is intentionally empty so all requests go to the current page
// origin (localhost:5173 in dev).  Vite's server.proxy then forwards /api,
// /o, and /accounts to localhost:8000 transparently.  This keeps every
// request same-origin from the browser's perspective, which is required for
// SameSite=Lax cookies to be sent on XHR/fetch requests.
const api = axios.create({
  baseURL: "",
  withCredentials: true, // send cookies with every request
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
})

const REFRESH_URL = "/api/auth/token/refresh/"

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

function isRefreshRequest(config?: InternalAxiosRequestConfig): boolean {
  return typeof config?.url === "string" && config.url.includes(REFRESH_URL)
}

// Access and refresh tokens both live in httpOnly cookies (AUTH_KIT's
// USE_AUTH_COOKIE in Backend/config/settings/base.py), so the frontend can't
// read their expiry to refresh proactively. Instead, react to the first 401
// caused by an expired 10-minute access token: silently exchange the refresh
// cookie for a new pair via REFRESH_URL, then retry the original request once.
// Concurrent 401s share a single in-flight refresh call rather than each
// firing their own.
let refreshPromise: Promise<unknown> | null = null

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryableRequestConfig | undefined

    if (
      error.response?.status !== 401 ||
      !config ||
      config._retry ||
      isRefreshRequest(config)
    ) {
      throw error
    }

    config._retry = true

    try {
      refreshPromise ??= api.post(REFRESH_URL).finally(() => {
        refreshPromise = null
      })
      await refreshPromise
    } catch {
      throw error
    }

    return api(config)
  }
)

export default api
export { api }
