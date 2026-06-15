import { useState } from "react"
import { Link } from "react-router"
import { api } from "~/services/api"
import { Button } from "~/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { LockIcon, Mail01Icon } from "@hugeicons/core-free-icons"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await api.post("/api/auth/password/reset/", { email })
      setSubmitted(true)
    } catch (err: unknown) {
      if (import.meta.env.DEV) console.error(err)
      // Surface error only for unexpected failures; a 200 with wrong email is
      // intentionally ambiguous to prevent user enumeration.
      setError("Something went wrong. Please try again.")
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
          <p className="mt-2 text-sm text-zinc-400">Reset your account password</p>
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
                  If <span className="font-medium text-zinc-200">{email}</span> is registered, a password
                  reset link is on its way.
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
                Forgot Password
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
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

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full cursor-pointer rounded-xl bg-zinc-100 py-3 font-semibold text-zinc-950 transition duration-300 hover:bg-zinc-200"
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>

              <p className="mt-6 text-center text-xs text-zinc-500">
                Remembered it?{" "}
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
