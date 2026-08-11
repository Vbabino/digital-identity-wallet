import { useState } from "react"
import { useNavigate } from "react-router"
import { Delete02Icon, FileDownloadIcon, PaintBoardIcon } from "@hugeicons/core-free-icons"
import { Button } from "~/components/ui/button"
import { ThemeToggle } from "~/components/ThemeToggle"
import { SectionCard } from "../components/SectionCard"
import { ConfirmDialog } from "../components/ConfirmDialog"
import { api } from "~/services/api"
import { extractApiError } from "~/lib/errors"

const GENERIC_EXPORT_ERROR = "Failed to export wallet data. Please try again."
const GENERIC_DELETE_ERROR = "Failed to delete account. Please try again."
const DELETE_CONFIRM_PHRASE = "DELETE"

async function extractBlobError(err: unknown): Promise<string> {
  const data = (err as { response?: { data?: unknown } })?.response?.data
  if (!(data instanceof Blob)) return GENERIC_EXPORT_ERROR
  try {
    const text = await data.text()
    const parsed = JSON.parse(text) as { detail?: unknown }
    return typeof parsed.detail === "string" ? parsed.detail : GENERIC_EXPORT_ERROR
  } catch {
    return GENERIC_EXPORT_ERROR
  }
}

export function SettingsTab() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [confirmText, setConfirmText] = useState("")
  const [showFinalConfirm, setShowFinalConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleExport = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await api.get("/api/wallet/export/", { responseType: "blob" })
      const url = URL.createObjectURL(res.data as Blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "wallet_export.json"
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (err: unknown) {
      if (import.meta.env.DEV) console.error(err)
      setError(await extractBlobError(err))
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    setDeleteError(null)

    try {
      await api.delete("/api/wallet/delete-account/")
      navigate("/login", { state: { notice: "Your account has been permanently deleted." } })
    } catch (err: unknown) {
      if (import.meta.env.DEV) console.error(err)
      setDeleteError(extractApiError(err, GENERIC_DELETE_ERROR))
      setShowFinalConfirm(false)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-8">
      <SectionCard
        icon={PaintBoardIcon}
        title="Appearance"
        subtitle="Switch between light and dark mode."
      >
        <ThemeToggle showLabel />
      </SectionCard>

      <SectionCard
        icon={FileDownloadIcon}
        title="Export Wallet Data"
        subtitle="Download a complete copy of your wallet data — all identity records, credentials, and access logs — as a JSON file."
      >
        {error && (
          <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-400">
            {error}
          </div>
        )}
        <Button
          variant="gradient-primary"
          disabled={isLoading}
          onClick={handleExport}
          className="cursor-pointer rounded-xl px-5 py-2 text-xs font-semibold"
        >
          {isLoading ? "Preparing…" : "Download Export"}
        </Button>
      </SectionCard>

      <SectionCard
        icon={Delete02Icon}
        title="Delete Account"
        subtitle="Permanently erase your account and all wallet data — identity records, credentials, and access logs. This cannot be undone."
      >
        {deleteError && (
          <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-400">
            {deleteError}
          </div>
        )}
        <label htmlFor="delete-account-confirm" className="mb-2 block text-xs text-muted-foreground">
          Type <span className="font-semibold text-red-400">{DELETE_CONFIRM_PHRASE}</span> to
          confirm.
        </label>
        <input
          id="delete-account-confirm"
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className="mb-4 w-full max-w-xs rounded-xl border border-border bg-input/30 px-3 py-2 text-sm text-foreground outline-none focus:border-red-500/50"
          autoComplete="off"
        />
        <div>
          <Button
            variant="danger"
            disabled={confirmText !== DELETE_CONFIRM_PHRASE || isDeleting}
            onClick={() => setShowFinalConfirm(true)}
            className="cursor-pointer rounded-xl px-5 py-2 text-xs font-semibold"
          >
            Delete My Account
          </Button>
        </div>
      </SectionCard>

      <ConfirmDialog
        open={showFinalConfirm}
        onCancel={() => setShowFinalConfirm(false)}
        onConfirm={handleDeleteAccount}
        title="Permanently delete your account?"
        body="This will erase your entire wallet, all identity records, credentials, and login access. This cannot be undone."
        confirmLabel={isDeleting ? "Deleting…" : "Delete Account"}
      />
    </div>
  )
}
