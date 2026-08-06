import { useState } from "react"
import { FileDownloadIcon } from "@hugeicons/core-free-icons"
import { Button } from "~/components/ui/button"
import { SectionCard } from "../components/SectionCard"
import { api } from "~/services/api"

const GENERIC_EXPORT_ERROR = "Failed to export wallet data. Please try again."

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
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <div className="space-y-8">
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
    </div>
  )
}
