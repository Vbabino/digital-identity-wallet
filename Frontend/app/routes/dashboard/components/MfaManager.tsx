import { HugeiconsIcon } from "@hugeicons/react"
import { ShieldIcon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { Button } from "~/components/ui/button"
import { SectionCard } from "./SectionCard"
import { useMfa } from "../hooks/useMfa"
import { MfaMethodCard } from "./MfaMethodCard"
import { MfaSetupChoose, MfaSetupConfirm } from "./MfaSetupFlow"
import { MfaBackupCodes } from "./MfaBackupCodes"

export function MfaManager() {
  const {
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
  } = useMfa()

  return (
    <SectionCard
      icon={ShieldIcon}
      title="Two-Factor Authentication"
      subtitle="Add an extra layer of security to your account."
      action={
        view === "list" ? (
          <Button
            type="button"
            onClick={() => setView("setup-choose")}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-input bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground transition hover:bg-secondary/80"
          >
            <HugeiconsIcon icon={PlusSignIcon} className="h-3.5 w-3.5" />
            Add method
          </Button>
        ) : undefined
      }
    >
      {view === "list" && (
        <div className="space-y-4">
          {actionStatus && (
            <div
              className={`rounded-xl border p-3 text-xs ${
                actionStatus.type === "success"
                  ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
                  : "border-red-500/20 bg-red-500/5 text-red-400"
              }`}
            >
              {actionStatus.msg}
            </div>
          )}
          {listLoading ? (
            <p className="text-xs text-muted-foreground">Loading…</p>
          ) : listError ? (
            <p className="text-xs text-red-400">{listError}</p>
          ) : methods.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No MFA methods configured. Click{" "}
              <strong className="text-foreground">Add method</strong> to get started.
            </p>
          ) : (
            <div className="space-y-3">
              {methods.map((m) => (
                <MfaMethodCard
                  key={m.name}
                  method={m}
                  onAction={(action, code) => handleAction(m, action, code)}
                  actionLoading={actionLoading}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {view === "setup-choose" && (
        <MfaSetupChoose
          setupLoading={setupLoading}
          setupError={setupError}
          onChoose={handleStartSetup}
          onBack={goToList}
        />
      )}

      {view === "setup-confirm" && (
        <MfaSetupConfirm
          setupMethod={setupMethod}
          setupData={setupData}
          setupCode={setupCode}
          setSetupCode={setSetupCode}
          setupLoading={setupLoading}
          setupError={setupError}
          onConfirm={handleConfirmSetup}
          onBack={() => setView("setup-choose")}
        />
      )}

      {view === "backup-codes" && (
        <MfaBackupCodes
          backupCodes={backupCodes}
          copied={copied}
          onCopy={handleCopyBackupCodes}
          onDone={goToList}
        />
      )}
    </SectionCard>
  )
}
