import { useEffect, useState } from "react"
import { api } from "~/services/api"
import { extractApiError } from "~/lib/errors"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MfaMethod {
  name: string
  is_active: boolean
  is_primary: boolean
  is_setup: boolean
}

export type MfaView = "list" | "setup-choose" | "setup-confirm" | "backup-codes"

export interface SetupData {
  qr_link?: string
  qr_code?: string
  [key: string]: unknown
}

// ─── Constants ────────────────────────────────────────────────────────────────

const METHOD_LABELS: Record<string, string> = {
  email: "Email",
  app: "Authenticator App",
}

export function methodLabel(name: string): string {
  return METHOD_LABELS[name] ?? name
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useMfa() {
  const [view, setView] = useState<MfaView>("list")
  const [methods, setMethods] = useState<MfaMethod[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<Set<string>>(new Set())
  const [actionStatus, setActionStatus] = useState<{
    type: "success" | "error"
    msg: string
  } | null>(null)

  const [setupMethod, setSetupMethod] = useState<"email" | "app" | "">("")
  const [setupData, setSetupData] = useState<SetupData | null>(null)
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [setupCode, setSetupCode] = useState("")
  const [setupLoading, setSetupLoading] = useState(false)
  const [setupError, setSetupError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const fetchMethods = async (signal?: AbortSignal) => {
    setListLoading(true)
    setListError(null)
    try {
      const { data } = await api.get("/api/auth/mfa/", signal ? { signal } : undefined)
      setMethods(Array.isArray(data) ? data : (data.methods ?? []))
    } catch (err: unknown) {
      if ((err as { name?: string })?.name === "CanceledError") return
      if (import.meta.env.DEV) console.error(err)
      setListError("Could not load MFA methods.")
    } finally {
      setListLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    fetchMethods(controller.signal)
    return () => controller.abort()
  }, [])

  const showStatus = (type: "success" | "error", msg: string) => {
    setActionStatus({ type, msg })
    setTimeout(() => setActionStatus(null), 4000)
  }

  const handleAction = async (
    method: MfaMethod,
    action: "primary" | "deactivate" | "delete" | "send",
    code?: string,
  ) => {
    const key = `${method.name}:${action}`
    setActionLoading((prev) => new Set(prev).add(key))

    const endpointMap = {
      primary: "/api/auth/mfa/primary/",
      deactivate: "/api/auth/mfa/deactivate/",
      delete: "/api/auth/mfa/delete/",
      send: "/api/auth/mfa/send/",
    }
    const successMsg = {
      primary: `${methodLabel(method.name)} is now your primary MFA method.`,
      deactivate: `${methodLabel(method.name)} has been deactivated.`,
      delete: `${methodLabel(method.name)} has been deleted.`,
      send: "Verification code sent.",
    }

    try {
      const body: Record<string, string> = { method: method.name }
      if (code) body.code = code
      await api.post(endpointMap[action], body)
      showStatus("success", successMsg[action])
      await fetchMethods()
    } catch (err: unknown) {
      if (import.meta.env.DEV) console.error(err)
      showStatus("error", extractApiError(err, "Action failed. Please try again."))
    } finally {
      setActionLoading((prev) => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
    }
  }

  const handleStartSetup = async (method: "email" | "app") => {
    setSetupMethod(method)
    setSetupError(null)
    setSetupLoading(true)
    try {
      const { data } = await api.post("/api/auth/mfa/", { method })
      setSetupData(data.setup_data ?? null)
      setBackupCodes(data.backup_codes ?? [])
      setView("setup-confirm")
    } catch (err: unknown) {
      if (import.meta.env.DEV) console.error(err)
      setSetupError(extractApiError(err, "Could not start setup. Please try again."))
    } finally {
      setSetupLoading(false)
    }
  }

  const handleConfirmSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!setupCode) {
      setSetupError("Please enter the verification code.")
      return
    }
    setSetupLoading(true)
    setSetupError(null)
    try {
      await api.post("/api/auth/mfa/confirm/", { method: setupMethod, code: setupCode })
      setView("backup-codes")
    } catch (err: unknown) {
      if (import.meta.env.DEV) console.error(err)
      setSetupError(extractApiError(err, "Invalid code. Please try again."))
      setSetupCode("")
    } finally {
      setSetupLoading(false)
    }
  }

  const handleCopyBackupCodes = async () => {
    try {
      await navigator.clipboard.writeText(backupCodes.join("\n"))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err: unknown) {
      if (import.meta.env.DEV) console.error(err)
    }
  }

  const resetSetup = () => {
    setSetupMethod("")
    setSetupData(null)
    setSetupCode("")
    setSetupError(null)
    setBackupCodes([])
    setCopied(false)
  }

  const goToList = () => {
    resetSetup()
    setView("list")
    fetchMethods()
  }

  return {
    view,
    setView,
    methods,
    listLoading,
    listError,
    actionLoading,
    actionStatus,
    setupMethod,
    setupData,
    backupCodes,
    setupCode,
    setSetupCode,
    setupLoading,
    setupError,
    copied,
    handleAction,
    handleStartSetup,
    handleConfirmSetup,
    handleCopyBackupCodes,
    goToList,
  }
}
