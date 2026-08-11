import React, { memo } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ShieldIcon, PencilEdit01Icon, Delete02Icon, Add01Icon } from "@hugeicons/core-free-icons"
import { Button } from "~/components/ui/button"
import { SectionCard } from "../components/SectionCard"
import { EmptyState } from "../components/EmptyState"
import { PrivacyBadge } from "../components/PrivacyBadge"
import type { DashboardState } from "../hooks/useDashboard"
import type { Credential } from "../types"

interface CredentialsTabProps {
  dashboard: DashboardState
}

export const CredentialsTab = memo(function CredentialsTab({ dashboard }: CredentialsTabProps) {
  const {
    credentials,
    setCredentials,
    openModal,
    handleDeleteRecord,
    toggleVisibility,
  } = dashboard

  return (
    <div className="space-y-8">
      <SectionCard
        icon={ShieldIcon}
        title="Verified Identity Documents"
        subtitle="Government-issued or institutional verification claims mapped to standard scopes."
        action={
          <Button
            variant="gradient-primary"
            onClick={() => openModal("credential", "create")}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-medium"
          >
            <HugeiconsIcon icon={Add01Icon} className="h-3.5 w-3.5" /> Add Document
          </Button>
        }
      >
        {credentials.length === 0 ? (
          <EmptyState message="No verified credentials registered in your wallet." />
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {credentials.map((cred) => (
              <div
                key={cred.id}
                className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card/10 p-6"
              >
                <div className="absolute top-0 right-0 h-2 w-full bg-gradient-to-r from-blue-500 to-violet-600" />

                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-xs font-bold text-blue-400 uppercase">
                        {cred.credential_type}
                      </span>
                      <h4 className="text-lg font-extrabold text-foreground">{cred.credential_name}</h4>
                    </div>
                    {cred.credential_description && (
                      <p className="line-clamp-2 max-w-xl text-sm text-muted-foreground">{cred.credential_description}</p>
                    )}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 pt-3 text-xs text-muted-foreground sm:grid-cols-4">
                      <div>
                        <p className="font-bold tracking-wider text-muted-foreground uppercase">Document ID</p>
                        <p className="mt-0.5 font-semibold text-foreground">{cred.credential_id}</p>
                      </div>
                      <div>
                        <p className="font-bold tracking-wider text-muted-foreground uppercase">Issuer</p>
                        <p className="mt-0.5 font-semibold text-foreground">{cred.issuing_authority}</p>
                      </div>
                      <div>
                        <p className="font-bold tracking-wider text-muted-foreground uppercase">Issue Date</p>
                        <p className="mt-0.5 font-semibold text-foreground">{cred.issuance_date}</p>
                      </div>
                      <div>
                        <p className="font-bold tracking-wider text-muted-foreground uppercase">Expiry Date</p>
                        <p className="mt-0.5 font-semibold text-red-400/80">{cred.expiry_date}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between gap-4 self-stretch">
                    <PrivacyBadge
                      visibility={cred.visibility}
                      size="sm"
                      onClick={() =>
                        toggleVisibility("credentials", cred.id, cred.visibility, (updated) => {
                          setCredentials(credentials.map((c) => (c.id === cred.id ? updated as Credential : c)))
                        })
                      }
                    />
                    {cred.credential_url && (
                      <a
                        href={cred.credential_url.startsWith("https://") ? cred.credential_url : undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-xs font-semibold text-blue-400 hover:underline"
                      >
                        View File Source ↗
                      </a>
                    )}
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-end space-x-3 border-t border-border/40 pt-4">
                  <button
                    onClick={() => openModal("credential", "edit", cred)}
                    className="flex cursor-pointer items-center gap-0.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  >
                    <HugeiconsIcon icon={PencilEdit01Icon} className="h-3 w-3" /> Modify Attributes
                  </button>
                  <span className="text-border">|</span>
                  <button
                    onClick={() => handleDeleteRecord("credentials", cred.id, () => setCredentials(prev => prev.filter(c => c.id !== cred.id)))}
                    className="flex cursor-pointer items-center gap-0.5 text-xs font-semibold text-red-400/80 hover:text-red-400"
                  >
                    <HugeiconsIcon icon={Delete02Icon} className="h-3 w-3" /> Revoke Document
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  )
})
