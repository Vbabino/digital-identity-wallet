import { useEffect, useState } from "react"
import { useSearchParams } from "react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import { GlobeIcon } from "@hugeicons/core-free-icons"
import { SectionCard } from "./SectionCard"
import { Button } from "~/components/ui/button"
import { GoogleIcon } from "~/components/icons/GoogleIcon"
import { api } from "~/services/api"
import { extractApiError } from "~/lib/errors"
import { buildGoogleOAuthUrl } from "~/lib/pkce"

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string
const REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI as string

interface SocialAccount {
  id: number
  provider: string
  uid: string
  last_login: string | null
  date_joined: string
}

function providerLabel(provider: string) {
  return provider.charAt(0).toUpperCase() + provider.slice(1)
}

function formatDate(iso: string | null) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function SocialAccountsManager() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [disconnecting, setDisconnecting] = useState<Set<number>>(new Set())
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [connectLoading, setConnectLoading] = useState(false)
  const [connectError, setConnectError] = useState<string | null>(null)
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; msg: string } | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const [searchParams, setSearchParams] = useSearchParams()

  // Consume the ?social_connected= param that auth-callback sets after a
  // successful connect flow, show a banner, clean the URL, and trigger a refetch.
  useEffect(() => {
    const connected = searchParams.get("social_connected")
    if (connected) {
      setStatusMsg({ type: "success", msg: `${providerLabel(connected)} account connected successfully.` })
      const next = new URLSearchParams(searchParams)
      next.delete("social_connected")
      setSearchParams(next, { replace: true })
      setRefreshKey((k) => k + 1)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    api
      .get<SocialAccount[]>("/api/auth/social/accounts/")
      .then((res) => setAccounts(res.data))
      .catch((err) => setError(extractApiError(err, "Failed to load connected accounts.")))
      .finally(() => setLoading(false))
  }, [refreshKey])

  const handleConnect = async () => {
    if (!GOOGLE_CLIENT_ID || !REDIRECT_URI) {
      setConnectError(
        "Google OAuth is not configured. Set VITE_GOOGLE_CLIENT_ID and VITE_GOOGLE_REDIRECT_URI in Frontend/.env."
      )
      return
    }
    setConnectLoading(true)
    setConnectError(null)
    try {
      window.location.href = await buildGoogleOAuthUrl(GOOGLE_CLIENT_ID, REDIRECT_URI, "connect")
    } catch (err: unknown) {
      if (import.meta.env.DEV) console.error(err)
      setConnectError("Failed to initiate Google connection. Please try again.")
      setConnectLoading(false)
    }
  }

  const handleDisconnect = async (id: number) => {
    setConfirmId(null)
    setDisconnecting((prev) => new Set(prev).add(id))
    setStatusMsg(null)
    try {
      await api.delete(`/api/auth/social/accounts/${id}/`)
      setAccounts((prev) => prev.filter((a) => a.id !== id))
      setStatusMsg({ type: "success", msg: "Social account disconnected." })
      setRefreshKey((k) => k + 1)
    } catch (err: unknown) {
      if (import.meta.env.DEV) console.error(err)
      setStatusMsg({ type: "error", msg: extractApiError(err, "Failed to disconnect account.") })
    } finally {
      setDisconnecting((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  return (
    <SectionCard
      icon={GlobeIcon}
      title="Connected Social Accounts"
      subtitle="Social accounts linked to your identity. Disconnecting removes the login method but keeps your account."
      action={
        <button
          disabled={connectLoading}
          onClick={handleConnect}
          className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-input bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground transition hover:bg-secondary/80 disabled:opacity-50"
        >
          <GoogleIcon className="h-3.5 w-3.5" />
          {connectLoading ? "Redirecting…" : "Connect Google"}
        </button>
      }
    >
      <div className="space-y-4">
        {connectError && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-400">
            {connectError}
          </div>
        )}

        {statusMsg && (
          <div
            className={`rounded-xl border p-3 text-xs ${
              statusMsg.type === "success"
                ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
                : "border-red-500/20 bg-red-500/5 text-red-400"
            }`}
          >
            {statusMsg.msg}
          </div>
        )}

        {loading ? (
          <p className="text-xs text-muted-foreground">Loading…</p>
        ) : error ? (
          <p className="text-xs text-red-400">{error}</p>
        ) : accounts.length === 0 ? (
          <p className="text-xs text-muted-foreground">No social accounts connected.</p>
        ) : (
          <div className="space-y-3">
            {accounts.map((account) => (
              <div key={account.id} className="rounded-2xl border border-border bg-muted/40 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted">
                      <HugeiconsIcon icon={GlobeIcon} className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {providerLabel(account.provider)}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Connected {formatDate(account.date_joined)}
                        {account.last_login && ` · Last used ${formatDate(account.last_login)}`}
                      </p>
                    </div>
                  </div>

                  <button
                    disabled={disconnecting.has(account.id)}
                    onClick={() => setConfirmId(account.id)}
                    className="shrink-0 rounded-lg border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition hover:border-red-500/30 hover:text-red-400 disabled:opacity-50"
                  >
                    {disconnecting.has(account.id) ? "Disconnecting…" : "Disconnect"}
                  </button>
                </div>

                {confirmId === account.id && (
                  <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/5 p-3">
                    <p className="text-xs text-red-300">
                      Disconnect <strong>{providerLabel(account.provider)}</strong>? You won't be
                      able to use it to sign in.
                    </p>
                    <div className="mt-2 flex gap-2">
                      <Button
                        variant="destructive"
                        size="xs"
                        onClick={() => handleDisconnect(account.id)}
                      >
                        Disconnect
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => setConfirmId(null)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </SectionCard>
  )
}
