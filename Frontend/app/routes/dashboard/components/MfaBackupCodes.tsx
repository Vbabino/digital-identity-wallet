import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, CheckmarkCircle01Icon } from "@hugeicons/core-free-icons"
import { Button } from "~/components/ui/button"

export function MfaBackupCodes({
  backupCodes,
  copied,
  onCopy,
  onDone,
}: {
  backupCodes: string[]
  copied: boolean
  onCopy: () => void
  onDone: () => void
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
        <HugeiconsIcon
          icon={CheckmarkCircle01Icon}
          className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400"
        />
        <div>
          <p className="text-sm font-semibold text-emerald-300">Method activated!</p>
          <p className="mt-0.5 text-xs text-zinc-400">
            Save these backup codes somewhere safe. Each code can only be used once and lets you
            access your account if you lose access to your MFA device.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {backupCodes.map((code, i) => (
            <div
              key={i}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-center font-mono text-xs tracking-wider text-zinc-200"
            >
              {code}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCopy}
          className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-medium text-zinc-300 transition hover:border-zinc-700 hover:text-zinc-100"
        >
          <HugeiconsIcon
            icon={copied ? CheckmarkCircle01Icon : Copy01Icon}
            className={`h-3.5 w-3.5 ${copied ? "text-emerald-400" : ""}`}
          />
          {copied ? "Copied!" : "Copy all"}
        </button>
        <Button
          type="button"
          onClick={onDone}
          className="cursor-pointer rounded-xl bg-zinc-100 px-5 py-2 text-xs font-semibold text-zinc-950 hover:bg-zinc-200"
        >
          Done
        </Button>
      </div>
    </div>
  )
}
