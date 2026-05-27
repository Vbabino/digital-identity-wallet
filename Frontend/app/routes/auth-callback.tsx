import { redirect, useLoaderData, useNavigate } from "react-router"
import type { ClientLoaderFunctionArgs } from "react-router"
import { api } from "~/services/api"
import { HugeiconsIcon } from "@hugeicons/react"
import { AlertCircleIcon, ArrowLeftIcon } from "@hugeicons/core-free-icons"
import { Button } from "~/components/ui/button"

export async function clientLoader({ request }: ClientLoaderFunctionArgs) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const returnedState = url.searchParams.get("state")

  const expectedState = sessionStorage.getItem("oauth_state")
  const pkceVerifier = sessionStorage.getItem("pkce_verifier")
  sessionStorage.removeItem("oauth_state")
  sessionStorage.removeItem("pkce_verifier")

  if (!returnedState || returnedState !== expectedState) {
    return {
      error:
        "Security validation failed: the OAuth state parameter is missing or does not match. " +
        "This callback may have been tampered with. Please start the sign-in process again.",
    }
  }

  if (!code) {
    return { error: "Authorization code is missing from the callback URL." }
  }

  try {
    await api.post("/api/auth/social/google/", {
      code,
      ...(pkceVerifier ? { code_verifier: pkceVerifier } : {}),
    })
  } catch (err: any) {
    return {
      error:
        err.response?.data?.detail ||
        "Failed to complete authentication with Google. Please ensure your credentials are valid.",
    }
  }

  return redirect("/dashboard")
}

// Only renders when the loader returns an error (success path always redirects)
export default function AuthCallback() {
  const { error } = useLoaderData<typeof clientLoader>()
  const navigate = useNavigate()

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-zinc-950 p-6 font-sans text-zinc-100">
      <div className="absolute top-1/4 left-1/4 -z-10 h-96 w-96 animate-pulse rounded-full bg-blue-500/10 blur-[100px]" />
      <div className="absolute right-1/4 bottom-1/4 -z-10 h-96 w-96 animate-pulse rounded-full bg-violet-500/10 blur-[100px] [animation-delay:2s]" />

      <div className="w-full max-w-md space-y-8">
        <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/60 p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col items-center space-y-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 shadow-lg">
              <HugeiconsIcon icon={AlertCircleIcon} className="h-8 w-8 text-red-500" />
            </div>
            <div className="space-y-2">
              <h1 className="font-heading text-2xl font-bold tracking-tight text-red-500">
                Authentication Failed
              </h1>
              <p className="text-sm leading-relaxed text-zinc-400">{error}</p>
            </div>
            <Button
              variant="dark-action"
              onClick={() => navigate("/login")}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-3 font-semibold"
            >
              <HugeiconsIcon icon={ArrowLeftIcon} className="h-4 w-4" />
              Back to Sign In
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
