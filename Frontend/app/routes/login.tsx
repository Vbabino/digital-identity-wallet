import { useState } from "react"
import { useNavigate } from "react-router"
import { api } from "~/services/api"
import { Button } from "~/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { LockIcon, ActivityIcon } from "@hugeicons/core-free-icons"

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

/** Generates a cryptographically random hex string used as the OAuth state token. */
function generateOAuthState(): string {
  const arr = new Uint8Array(16)
  crypto.getRandomValues(arr)
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("")
}

/** Base64url encode (no padding) — required by RFC 7636 for PKCE. */
function base64urlEncode(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
}

/**
 * Generates a PKCE code_verifier (32 random bytes, base64url) and its
 * corresponding code_challenge (SHA-256 of the verifier, base64url).
 */
async function generatePKCE(): Promise<{ verifier: string; challenge: string }> {
  const verifierBytes = new Uint8Array(32)
  crypto.getRandomValues(verifierBytes)
  const verifier = base64urlEncode(verifierBytes.buffer)
  const challengeBytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier)
  )
  const challenge = base64urlEncode(challengeBytes)
  return { verifier, challenge }
}

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError("Please enter both email and password.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await api.post("/api/auth/login/", { email, password })
      // Login successful, redirect to dashboard
      navigate("/dashboard")
    } catch (err: any) {
      if (import.meta.env.DEV) console.error(err)
      setError("Authentication failed. Please verify your credentials.")
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
      await api.post("/api/auth/login/", {
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      })
      navigate("/dashboard")
    } catch (err: any) {
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

    // Generate an anti-CSRF state token and a PKCE verifier+challenge pair.
    // The verifier is kept in sessionStorage so auth-callback.tsx can send it
    // to the backend, which forwards it to Google's token endpoint to complete
    // the S256 PKCE verification (RFC 7636).
    const state = generateOAuthState()
    const { verifier, challenge } = await generatePKCE()
    sessionStorage.setItem("oauth_state", state)
    sessionStorage.setItem("pkce_verifier", verifier)

    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth")
    authUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID)
    authUrl.searchParams.set("redirect_uri", REDIRECT_URI)
    authUrl.searchParams.set("response_type", "code")
    authUrl.searchParams.set("scope", "email")
    // "online" matches the backend's AUTH_PARAMS configuration; the backend
    // handles sessions directly so a refresh token is not needed here.
    authUrl.searchParams.set("access_type", "online")
    authUrl.searchParams.set("prompt", "consent")
    authUrl.searchParams.set("state", state)
    authUrl.searchParams.set("code_challenge", challenge)
    authUrl.searchParams.set("code_challenge_method", "S256")

    window.location.href = authUrl.toString()
  }

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
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.111C18.281 1.09 15.547 0 12.24 0 5.58 0 0 5.37 0 12s5.58 12 12.24 12c6.96 0 11.57-4.89 11.57-11.79 0-.795-.085-1.4-.19-1.925H12.24z"
                  />
                </svg>
                Sign In with Google
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
