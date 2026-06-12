import QRCode from "react-qr-code"
import { HugeiconsIcon } from "@hugeicons/react"
import { Mail01Icon, SmartPhone01Icon, ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { Button } from "~/components/ui/button"
import type { SetupData } from "../hooks/useMfa"
import { methodLabel } from "../hooks/useMfa"

// ─── Choose method ────────────────────────────────────────────────────────────

export function MfaSetupChoose({
  setupLoading,
  setupError,
  onChoose,
  onBack,
}: {
  setupLoading: boolean
  setupError: string | null
  onChoose: (method: "email" | "app") => void
  onBack: () => void
}) {
  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-xs text-zinc-400 transition hover:text-zinc-200"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} className="h-3.5 w-3.5" />
        Back
      </button>

      <p className="text-sm font-semibold text-zinc-200">Choose a verification method</p>

      {setupError && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-400">
          {setupError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {(["email", "app"] as const).map((m) => {
          const Icon = m === "app" ? SmartPhone01Icon : Mail01Icon
          const label = methodLabel(m)
          const desc =
            m === "email"
              ? "Receive codes via email"
              : "Use Google Authenticator, Authy, or similar"
          return (
            <button
              key={m}
              type="button"
              disabled={setupLoading}
              onClick={() => onChoose(m)}
              className="flex flex-col items-start gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4 text-left transition hover:border-zinc-700 hover:bg-zinc-900/60 disabled:opacity-50"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800">
                <HugeiconsIcon icon={Icon} className="h-4 w-4 text-zinc-300" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-100">{label}</p>
                <p className="mt-0.5 text-xs text-zinc-500">{desc}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Confirm setup ────────────────────────────────────────────────────────────

export function MfaSetupConfirm({
  setupMethod,
  setupData,
  setupCode,
  setSetupCode,
  setupLoading,
  setupError,
  onConfirm,
  onBack,
}: {
  setupMethod: "email" | "app" | ""
  setupData: SetupData | null
  setupCode: string
  setSetupCode: (code: string) => void
  setupLoading: boolean
  setupError: string | null
  onConfirm: (e: React.FormEvent) => void
  onBack: () => void
}) {
  return (
    <form onSubmit={onConfirm} className="space-y-5">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-xs text-zinc-400 transition hover:text-zinc-200"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} className="h-3.5 w-3.5" />
        Back
      </button>

      <p className="text-sm font-semibold text-zinc-200">
        Activate {methodLabel(setupMethod)}
      </p>

      {setupError && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-400">
          {setupError}
        </div>
      )}

      {setupMethod === "app" && setupData?.qr_link && (
        <div className="space-y-3">
          <p className="text-xs text-zinc-400">
            Scan the QR code with your authenticator app, then enter the 6-digit code below.
          </p>
          <div className="flex justify-center rounded-2xl border border-zinc-800 bg-white p-4">
            <QRCode value={setupData.qr_link as string} size={160} />
          </div>
        </div>
      )}

      {setupMethod === "email" && (
        <p className="text-xs text-zinc-400">
          A verification code has been sent to your email address. Enter it below to activate this
          method.
        </p>
      )}

      <div>
        <label className="text-xs font-semibold text-zinc-400">Verification Code</label>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          required
          disabled={setupLoading}
          value={setupCode}
          onChange={(e) => setSetupCode(e.target.value.replace(/\D/g, "").slice(0, 12))}
          placeholder="000000"
          autoFocus
          className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-center text-xl font-mono tracking-[0.4em] text-zinc-100 placeholder-zinc-700 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <Button
        type="submit"
        disabled={setupLoading}
        className="cursor-pointer rounded-xl bg-zinc-100 px-5 py-2 text-xs font-semibold text-zinc-950 hover:bg-zinc-200 disabled:opacity-50"
      >
        {setupLoading ? "Activating…" : "Activate"}
      </Button>
    </form>
  )
}
