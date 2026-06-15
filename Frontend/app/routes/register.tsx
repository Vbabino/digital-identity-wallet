import { useState } from "react"
import { Link } from "react-router"
import { api } from "~/services/api"
import { Button } from "~/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { LockIcon, Mail01Icon } from "@hugeicons/core-free-icons"

function extractErrors(err: unknown): string {
  const data = (err as { response?: { data?: unknown } })?.response?.data
  if (!data || typeof data !== "object") return "Registration failed. Please try again."
  const messages = Object.values(data)
    .filter((v): v is unknown[] => Array.isArray(v))
    .flat()
    .filter((m): m is string => typeof m === "string")
  return messages.join(" ") || "Registration failed. Please try again."
}

export default function Register() {
  const [email, setEmail] = useState("")
  const [password1, setPassword1] = useState("")
  const [password2, setPassword2] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password1 !== password2) {
      setError("Passwords do not match.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await api.post("/api/auth/registration/", { email, password1, password2 })
      setSubmitted(true)
    } catch (err: unknown) {
      if (import.meta.env.DEV) console.error(err)
      setError(extractErrors(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-zinc-950 p-6 font-sans text-zinc-100">
      <div className="absolute top-1/4 left-1/4 -z-10 h-96 w-96 animate-pulse rounded-full bg-blue-500/10 blur-[100px]"></div>
      <div className="absolute right-1/4 bottom-1/4 -z-10 h-96 w-96 animate-pulse rounded-full bg-violet-500/10 blur-[100px] [animation-delay:2s]"></div>

      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-violet-600 shadow-lg shadow-blue-500/20">
            <HugeiconsIcon icon={LockIcon} className="h-6 w-6 text-white" />
          </div>
          <h1 className="mt-6 bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text font-heading text-3xl font-bold tracking-tight text-transparent">
            TrustVault
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Create your secure digital identity vault
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/60 p-8 shadow-2xl backdrop-blur-xl">
          {submitted ? (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10 ring-1 ring-blue-500/30">
                  <HugeiconsIcon icon={Mail01Icon} className="h-7 w-7 text-blue-400" />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-100">Check your inbox</h2>
                <p className="mt-2 text-sm text-zinc-400">
                  We sent a verification link to <span className="font-medium text-zinc-200">{email}</span>.
                  Click it to activate your account.
                </p>
              </div>
              <Link
                to="/login"
                className="block text-center text-sm font-medium text-zinc-400 transition hover:text-zinc-200"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h2 className="mb-6 text-center text-sm font-semibold tracking-wider text-zinc-400 uppercase">
                Create Account
              </h2>

              <form onSubmit={handleRegister} className="space-y-5">
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
                  <label className="block text-xs font-semibold tracking-wider text-zinc-400 uppercase">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    disabled={isLoading}
                    value={password1}
                    onChange={(e) => setPassword1(e.target.value)}
                    placeholder="••••••••"
                    className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 transition outline-none focus:border-blue-500 focus:bg-zinc-950 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-wider text-zinc-400 uppercase">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    disabled={isLoading}
                    value={password2}
                    onChange={(e) => setPassword2(e.target.value)}
                    placeholder="••••••••"
                    className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 transition outline-none focus:border-blue-500 focus:bg-zinc-950 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full cursor-pointer rounded-xl bg-zinc-100 py-3 font-semibold text-zinc-950 transition duration-300 hover:bg-zinc-200"
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>

              <p className="mt-6 text-center text-xs text-zinc-500">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-zinc-300 transition hover:text-white">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
