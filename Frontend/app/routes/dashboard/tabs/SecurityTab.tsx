import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { LockPasswordIcon } from "@hugeicons/core-free-icons"
import { Button } from "~/components/ui/button"
import { SectionCard } from "../components/SectionCard"
import { MfaManager } from "../components/MfaManager"
import { SocialAccountsManager } from "../components/SocialAccountsManager"
import { api } from "~/services/api"
import { extractApiError } from "~/lib/errors"

export function SecurityTab() {
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword1, setNewPassword1] = useState("")
  const [newPassword2, setNewPassword2] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword1 !== newPassword2) {
      setError("New passwords do not match.")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await api.post("/api/auth/password/change/", {
        old_password: oldPassword,
        new_password1: newPassword1,
        new_password2: newPassword2,
      })
      setSuccess(true)
      setOldPassword("")
      setNewPassword1("")
      setNewPassword2("")
    } catch (err: unknown) {
      if (import.meta.env.DEV) console.error(err)
      setError(extractApiError(err, "Password change failed. Please try again."))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <MfaManager />
      <SocialAccountsManager />
      <SectionCard
        icon={LockPasswordIcon}
        title="Change Password"
        subtitle="Update your account password. You will need your current password to confirm the change."
      >
        <form onSubmit={handleSubmit} className="max-w-md space-y-5">
          {success && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-400">
              Password updated successfully.
            </div>
          )}
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-zinc-400">Current Password</label>
            <input
              type="password"
              required
              disabled={isLoading}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400">New Password</label>
            <input
              type="password"
              required
              disabled={isLoading}
              value={newPassword1}
              onChange={(e) => setNewPassword1(e.target.value)}
              placeholder="••••••••"
              className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400">Confirm New Password</label>
            <input
              type="password"
              required
              disabled={isLoading}
              value={newPassword2}
              onChange={(e) => setNewPassword2(e.target.value)}
              placeholder="••••••••"
              className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="pt-1">
            <Button
              type="submit"
              disabled={isLoading}
              className="cursor-pointer rounded-xl bg-zinc-100 px-5 py-2 text-xs font-semibold text-zinc-950 hover:bg-zinc-200"
            >
              {isLoading ? "Updating…" : "Update Password"}
            </Button>
          </div>
        </form>
      </SectionCard>
    </div>
  )
}
