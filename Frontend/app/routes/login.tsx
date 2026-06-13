import { useEffect, useRef, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router"
import { api } from "~/services/api"
import { Button } from "~/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { LockIcon, ActivityIcon, SmartPhone01Icon, Mail01Icon } from "@hugeicons/core-free-icons"
import { buildGoogleOAuthUrl } from "~/lib/pkce"
import { GoogleIcon } from "~/components/icons/GoogleIcon"

// OAuth credentials and endpoints are loaded from environment variables so
// they can differ between local dev, staging, and production without a code
// change.  See Frontend/.env for the local-dev defaults.
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string
const REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI as string

// Demo account credentials — also configured via env vars so they are never
// committed as literals.  Only relevant in seeded development environments.
const DEMO_EMAIL = import.meta.env.VITE_DEMO_EMAIL as string | undefined
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD as string | undefined

if (import.meta.env.PROD && (DEMO_EMAIL || DEMO_PASSWORD)) {
  console.warn(
    "[security] Demo credentials are set in a production build. Remove VITE_DEMO_EMAIL and VITE_DEMO_PASSWORD from your production environment."
  )
}

type LoginStep = "credentials" | "mfa"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // MFA step state
  const [step, setStep] = useState<LoginStep>("credentials")
  const [ephemeralToken, setEphemeralToken] = useState("")
  const [mfaMethod, setMfaMethod] = useState("") // "email" | "app"
  const [mfaCode, setMfaCode] = useState("")
  const [resendStatus, setResendStatus] = useState<string | null>(null)

  const codeInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const notice = (location.state as { notice?: string } | null)?.notice

  // Auto-focus the code input when entering the MFA step
  useEffect(() => {
    if (step === "mfa") {
      codeInputRef.current?.focus()
    }
  }, [step])

  const handleLogin = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    if (!email || !password) {
      setError("Please enter both email and password.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data } = await api.post("/api/auth/login/", { email, password })
      if (data.mfa_enabled) {
        setEphemeralToken(data.ephemeral_token)
        setMfaMethod(data.method)
        setStep("mfa")
        return
      }
      navigate("/dashboard")
    } catch (err: unknown) {
      if (import.meta.env.DEV) console.error(err)
      setError("Authentication failed. Please verify your credentials.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleMfaVerify = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    if (!mfaCode) {
      setError("Please enter the verification code.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await api.post("/api/auth/login/verify/", {
        ephemeral_token: ephemeralToken,
        code: mfaCode,
      })
      navigate("/dashboard")
    } catch (err: unknown) {
      if (import.meta.env.DEV) console.error(err)
      setError("Invalid code. Please try again.")
      setMfaCode("")
      codeInputRef.current?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwitchMethod = async (newMethod: string) => {
    if (newMethod === mfaMethod || isLoading) return

    setIsLoading(true)
    setError(null)
    setResendStatus(null)

    try {
      const { data } = await api.post("/api/auth/login/change-method/", {
        ephemeral_token: ephemeralToken,
        new_method: newMethod,
      })
      const newToken = data.ephemeral_token
      setEphemeralToken(newToken)
      setMfaMethod(data.method)
      setMfaCode("")
      // Email method requires an explicit dispatch — fire-and-forget resend.
      if (newMethod === "email") {
        api.post("/api/auth/login/resend/", { ephemeral_token: newToken }).catch(() => {})
      }
      codeInputRef.current?.focus()
    } catch (err: unknown) {
      if (import.meta.env.DEV) console.error(err)
      setError("Could not switch method. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setIsLoading(true)
    setResendStatus(null)
    setError(null)

    try {
      await api.post("/api/auth/login/resend/", { ephemeral_token: ephemeralToken })
      setResendStatus("Code resent — check your email.")
    } catch (err: unknown) {
      if (import.meta.env.DEV) console.error(err)
      setResendStatus("Could not resend code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    if (!DEMO_EMAIL || !DEMO_PASSWORD) {
      setError(
        "Demo credentials are not configured. Set VITE_DEMO_EMAIL and VITE_DEMO_PASSWORD in Frontend/.env."
      )
      return
    }

    setIsLoading(true)
    setError(null)
    setEmail(DEMO_EMAIL)
    setPassword(DEMO_PASSWORD)

    try {
      const { data } = await api.post("/api/auth/login/", {
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      })
      if (data.mfa_enabled) {
        setEphemeralToken(data.ephemeral_token)
        setMfaMethod(data.method)
        setStep("mfa")
        return
      }
      navigate("/dashboard")
    } catch (err: unknown) {
      if (import.meta.env.DEV) console.error(err)
      setError(
        "Demo login failed. Make sure the database is migrated and seeded with matching credentials."
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    if (!GOOGLE_CLIENT_ID || !REDIRECT_URI) {
      setError(
        "Google OAuth is not configured. Set VITE_GOOGLE_CLIENT_ID and VITE_GOOGLE_REDIRECT_URI in Frontend/.env."
      )
      return
    }

    window.location.href = await buildGoogleOAuthUrl(GOOGLE_CLIENT_ID, REDIRECT_URI, "login")
  }

  const methodLabel =
    mfaMethod === "app" ? "Open your authenticator app" : "Check your email"

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-zinc-950 p-6 font-sans text-zinc-100">
      {/* Dynamic ambient background glow */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-96 w-96 animate-pulse rounded-full bg-blue-500/10 blur-[100px]"></div>
      <div className="absolute right-1/4 bottom-1/4 -z-10 h-96 w-96 animate-pulse rounded-full bg-violet-500/10 blur-[100px] [animation-delay:2s]"></div>

      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          {/* Logo Icon */}
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-violet-600 shadow-lg shadow-blue-500/20">
            <HugeiconsIcon icon={LockIcon} className="h-6 w-6 text-white" />
          </div>
          <h1 className="mt-6 bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text font-heading text-3xl font-bold tracking-tight text-transparent">
            TrustVault
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Securely store, manage, and share your digital identities
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/60 p-8 shadow-2xl backdrop-blur-xl">
          {step === "credentials" ? (
            <>
              {/* Demo Login Quick-Action widget */}
              {DEMO_EMAIL && DEMO_PASSWORD && (
                <div className="mb-6 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 text-center">
                  <p className="text-xs font-medium text-blue-300">
                    Demo Testing Environment
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    Log in instantly using the pre-seeded account `{DEMO_EMAIL}`.
                  </p>
                  <Button
                    type="button"
                    disabled={isLoading}
                    onClick={handleDemoLogin}
                    className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 py-2 font-medium text-white shadow-md transition duration-300 hover:from-blue-500 hover:to-violet-500"
                  >
                    <HugeiconsIcon icon={ActivityIcon} className="h-4 w-4" /> Demo
                    Auto-Login
                  </Button>
                </div>
              )}

              <div className="relative mb-6 flex items-center justify-center">
                <span className="absolute inset-x-0 h-px bg-zinc-800"></span>
                <span className="relative bg-zinc-900 px-3 text-xs text-zinc-500 uppercase">
                  Or Sign In Manually
                </span>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                {notice && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-400">
                    {notice}
                  </div>
                )}
                {error && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-400">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold tracking-wider text-zinc-400 uppercase">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    disabled={isLoading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 transition outline-none focus:border-blue-500 focus:bg-zinc-950 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold tracking-wider text-zinc-400 uppercase">
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-medium text-zinc-400 transition hover:text-zinc-200"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <input
                    type="password"
                    required
                    disabled={isLoading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 transition outline-none focus:border-blue-500 focus:bg-zinc-950 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-3">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full cursor-pointer rounded-xl bg-zinc-100 py-3 font-semibold text-zinc-950 transition duration-300 hover:bg-zinc-200"
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>

                  <Button
                    type="button"
                    disabled={isLoading}
                    onClick={handleGoogleLogin}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 py-3 font-semibold text-zinc-300 transition duration-300 hover:bg-zinc-900"
                  >
                    <GoogleIcon className="h-5 w-5" />
                    Sign In with Google
                  </Button>
                </div>
              </form>

              <p className="mt-6 text-center text-xs text-zinc-500">
                New here?{" "}
                <Link to="/register" className="font-medium text-zinc-300 transition hover:text-white">
                  Create an account
                </Link>
              </p>
            </>
          ) : (
            /* ── MFA verification step ── */
            <form onSubmit={handleMfaVerify} className="space-y-6">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800">
                  <HugeiconsIcon
                    icon={mfaMethod === "app" ? SmartPhone01Icon : Mail01Icon}
                    className="h-6 w-6 text-zinc-300"
                  />
                </div>
                <h2 className="text-lg font-bold text-white">Two-Factor Authentication</h2>
                <p className="mt-1 text-xs text-zinc-400">{methodLabel} and enter your code below.</p>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-400">
                  {error}
                </div>
              )}

              {resendStatus && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-400">
                  {resendStatus}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold tracking-wider text-zinc-400 uppercase">
                  Verification Code
                </label>
                <input
                  ref={codeInputRef}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  disabled={isLoading}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 12))}
                  placeholder="000000"
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-center text-xl font-mono tracking-[0.4em] text-zinc-100 placeholder-zinc-700 transition outline-none focus:border-blue-500 focus:bg-zinc-950 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Method switcher */}
              <div>
                <p className="mb-2 text-xs font-semibold tracking-wider text-zinc-400 uppercase">
                  Use a different method
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={isLoading || mfaMethod === "email"}
                    onClick={() => handleSwitchMethod("email")}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition ${
                      mfaMethod === "email"
                        ? "border-blue-500/40 bg-blue-500/10 text-blue-300"
                        : "border-zinc-800 bg-zinc-950/50 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                    } disabled:cursor-not-allowed`}
                  >
                    <HugeiconsIcon icon={Mail01Icon} className="h-3.5 w-3.5" />
                    Email
                  </button>
                  <button
                    type="button"
                    disabled={isLoading || mfaMethod === "app"}
                    onClick={() => handleSwitchMethod("app")}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition ${
                      mfaMethod === "app"
                        ? "border-blue-500/40 bg-blue-500/10 text-blue-300"
                        : "border-zinc-800 bg-zinc-950/50 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                    } disabled:cursor-not-allowed`}
                  >
                    <HugeiconsIcon icon={SmartPhone01Icon} className="h-3.5 w-3.5" />
                    Authenticator
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full cursor-pointer rounded-xl bg-zinc-100 py-3 font-semibold text-zinc-950 transition duration-300 hover:bg-zinc-200"
              >
                {isLoading ? "Verifying..." : "Verify"}
              </Button>

              <div className="flex items-center justify-between text-xs text-zinc-500">
                {mfaMethod === "email" ? (
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={handleResend}
                    className="font-medium text-zinc-400 transition hover:text-zinc-200 disabled:opacity-50"
                  >
                    Resend code
                  </button>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  onClick={() => {
                    setStep("credentials")
                    setError(null)
                    setMfaCode("")
                    setResendStatus(null)
                  }}
                  className="font-medium text-zinc-400 transition hover:text-zinc-200"
                >
                  ← Back to sign in
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
