import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router"
import { api } from "~/services/api"
import { HugeiconsIcon } from "@hugeicons/react"
import { LockIcon, CheckmarkCircle01Icon, Alert01Icon } from "@hugeicons/core-free-icons"

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const key = searchParams.get("key")

  const [status, setStatus] = useState<"pending" | "success" | "error">("pending")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!key) {
      setErrorMessage("No verification key found in the URL.")
      setStatus("error")
      return
    }

    api
      .post("/api/auth/registration/verify-email/", { key })
      .then(() => setStatus("success"))
      .catch((err: any) => {
        if (import.meta.env.DEV) console.error(err)
        const data = err?.response?.data
        const msg =
          (Array.isArray(data?.key) ? data.key[0] : null) ||
          data?.detail ||
          "Verification failed. The link may have expired."
        setErrorMessage(msg)
        setStatus("error")
      })
  }, [key])

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
        </div>

        <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/60 p-8 text-center shadow-2xl backdrop-blur-xl">
          {status === "pending" && (
            <div className="space-y-4">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-blue-500"></div>
              <p className="text-sm text-zinc-400">Verifying your email…</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/30">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-7 w-7 text-emerald-400" />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-100">Email verified</h2>
                <p className="mt-2 text-sm text-zinc-400">Your account is active. You can now sign in.</p>
              </div>
              <Link
                to="/login"
                className="block text-center text-sm font-medium text-zinc-400 transition hover:text-zinc-200"
              >
                Go to sign in →
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 ring-1 ring-red-500/30">
                  <HugeiconsIcon icon={Alert01Icon} className="h-7 w-7 text-red-400" />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-100">Verification failed</h2>
                <p className="mt-2 text-sm text-zinc-400">{errorMessage}</p>
              </div>
              <Link
                to="/login"
                className="block text-center text-sm font-medium text-zinc-400 transition hover:text-zinc-200"
              >
                Back to sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
