import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Mail01Icon, SmartPhone01Icon } from "@hugeicons/core-free-icons"
import type { MfaMethod } from "../hooks/useMfa"
import { methodLabel } from "../hooks/useMfa"

export function MfaMethodCard({
  method,
  onAction,
  actionLoading,
}: {
  method: MfaMethod
  onAction: (action: "primary" | "deactivate" | "delete" | "send", code?: string) => void
  actionLoading: Set<string>
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmDeleteCode, setConfirmDeleteCode] = useState("")
  const [confirmDeactivate, setConfirmDeactivate] = useState(false)
  const [confirmDeactivateCode, setConfirmDeactivateCode] = useState("")
  const isLoading = (action: string) => actionLoading.has(`${method.name}:${action}`)

  const label = methodLabel(method.name)
  const Icon = method.name === "app" ? SmartPhone01Icon : Mail01Icon

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-800">
            <HugeiconsIcon icon={Icon} className="h-4 w-4 text-zinc-300" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-100">{label}</p>
            <div className="mt-0.5 flex items-center gap-1.5">
              {method.is_active ? (
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                  Active
                </span>
              ) : (
                <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-500">
                  Inactive
                </span>
              )}
              {method.is_primary && (
                <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
                  Primary
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
          {method.is_active && !method.is_primary && (
            <button
              disabled={isLoading("primary")}
              onClick={() => onAction("primary")}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-[11px] font-medium text-zinc-300 transition hover:border-zinc-700 hover:text-zinc-100 disabled:opacity-50"
            >
              Set Primary
            </button>
          )}
          {method.name === "email" && method.is_active && (
            <button
              disabled={isLoading("send")}
              onClick={() => onAction("send")}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-[11px] font-medium text-zinc-300 transition hover:border-zinc-700 hover:text-zinc-100 disabled:opacity-50"
            >
              Send Code
            </button>
          )}
          {method.is_active && (
            <button
              disabled={isLoading("deactivate")}
              onClick={() => setConfirmDeactivate(true)}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-[11px] font-medium text-zinc-400 transition hover:border-amber-500/30 hover:text-amber-400 disabled:opacity-50"
            >
              Deactivate
            </button>
          )}
          <button
            disabled={isLoading("delete")}
            onClick={() => setConfirmDelete(true)}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-[11px] font-medium text-zinc-400 transition hover:border-red-500/30 hover:text-red-400 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Inline deactivate confirmation */}
      {confirmDeactivate && (
        <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
          <p className="text-xs text-amber-300">
            Deactivate <strong>{label}</strong>? Enter your current MFA code to confirm.
          </p>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={confirmDeactivateCode}
            onChange={(e) => setConfirmDeactivateCode(e.target.value.replace(/\D/g, "").slice(0, 12))}
            placeholder="Enter verification code"
            className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs font-mono text-zinc-100 placeholder-zinc-600 outline-none focus:border-amber-500"
          />
          <div className="mt-2 flex gap-2">
            <button
              disabled={isLoading("deactivate") || !confirmDeactivateCode}
              onClick={() => {
                const code = confirmDeactivateCode
                setConfirmDeactivate(false)
                setConfirmDeactivateCode("")
                onAction("deactivate", code)
              }}
              className="rounded-lg bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/30 disabled:opacity-50"
            >
              Deactivate
            </button>
            <button
              onClick={() => {
                setConfirmDeactivate(false)
                setConfirmDeactivateCode("")
              }}
              className="rounded-lg px-3 py-1 text-xs font-medium text-zinc-400 transition hover:text-zinc-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Inline delete confirmation */}
      {confirmDelete && (
        <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/5 p-3">
          <p className="text-xs text-red-300">
            Permanently delete <strong>{label}</strong>? This cannot be undone.
          </p>
          {method.is_active && (
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={confirmDeleteCode}
              onChange={(e) => setConfirmDeleteCode(e.target.value.replace(/\D/g, "").slice(0, 12))}
              placeholder="Enter verification code"
              className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs font-mono text-zinc-100 placeholder-zinc-600 outline-none focus:border-red-500"
            />
          )}
          <div className="mt-2 flex gap-2">
            <button
              disabled={isLoading("delete") || (method.is_active && !confirmDeleteCode)}
              onClick={() => {
                const code = method.is_active ? confirmDeleteCode : undefined
                setConfirmDelete(false)
                setConfirmDeleteCode("")
                onAction("delete", code)
              }}
              className="rounded-lg bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-300 transition hover:bg-red-500/30 disabled:opacity-50"
            >
              Delete
            </button>
            <button
              onClick={() => {
                setConfirmDelete(false)
                setConfirmDeleteCode("")
              }}
              className="rounded-lg px-3 py-1 text-xs font-medium text-zinc-400 transition hover:text-zinc-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
