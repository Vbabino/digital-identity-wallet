import { type RouteConfig, index, route } from "@react-router/dev/routes"

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  route("forgot-password", "routes/forgot-password.tsx"),
  route("auth/callback/google", "routes/auth-callback.tsx"),
  route("auth/verify-email", "routes/verify-email.tsx"),
  route("auth/reset-password", "routes/reset-password.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("privacy", "routes/privacy.tsx"),
] satisfies RouteConfig
