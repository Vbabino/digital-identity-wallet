import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router"
import { api } from "~/services/api"
import { Button } from "~/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { LockIcon, Alert01Icon } from "@hugeicons/core-free-icons"

function extractErrors(err: unknown): string {
  const data = (err as { response?: { data?: unknown } })?.response?.data
  if (!data || typeof data !== "object") return "Password reset failed. Please try again."
  const messages = Object.values(data)
    .filter((v): v is unknown[] => Array.isArray(v))
    .flat()
    .filter((m): m is string => typeof m === "string")
  return messages.join(" ") || "Password reset failed. Please try again."
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const uid = searchParams.get("uid")
  const token = searchParams.get("token")

  const [newPassword1, setNewPassword1] = useState("")
  const [newPassword2, setNewPassword2] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const missingParams = !uid || !token

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword1 !== newPassword2) {
      setError("Passwords do not match.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await api.post("/api/auth/password/reset/confirm/", {
        uid,
        token,
        new_password1: newPassword1,
        new_password2: newPassword2,
      })
      navigate("/login", { state: { notice: "Password updated. You can now sign in." } })
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
          <p className="mt-2 text-sm text-zinc-400">Set a new password for your account</p>
        </div>

        <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/60 p-8 shadow-2xl backdrop-blur-xl">
          {missingParams ? (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 ring-1 ring-red-500/30">
                  <HugeiconsIcon icon={Alert01Icon} className="h-7 w-7 text-red-400" />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-100">Invalid reset link</h2>
                <p className="mt-2 text-sm text-zinc-400">
                  This link is missing required parameters. Request a new password reset.
                </p>
              </div>
              <Link
                to="/forgot-password"
                className="block text-center text-sm font-medium text-zinc-400 transition hover:text-zinc-200"
              >
                Request new link
              </Link>
            </div>
          ) : (
            <>
              <h2 className="mb-6 text-center text-sm font-semibold tracking-wider text-zinc-400 uppercase">
                New Password
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-400">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold tracking-wider text-zinc-400 uppercase">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    disabled={isLoading}
                    value={newPassword1}
                    onChange={(e) => setNewPassword1(e.target.value)}
                    placeholder="••••••••"
                    className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 transition outline-none focus:border-blue-500 focus:bg-zinc-950 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-wider text-zinc-400 uppercase">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    disabled={isLoading}
                    value={newPassword2}
                    onChange={(e) => setNewPassword2(e.target.value)}
                    placeholder="••••••••"
                    className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 transition outline-none focus:border-blue-500 focus:bg-zinc-950 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full cursor-pointer rounded-xl bg-zinc-100 py-3 font-semibold text-zinc-950 transition duration-300 hover:bg-zinc-200"
                >
                  {isLoading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
