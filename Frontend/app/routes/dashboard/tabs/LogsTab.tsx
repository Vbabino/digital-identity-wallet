import React, { memo } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ActivityIcon } from "@hugeicons/core-free-icons"
import { Button } from "~/components/ui/button"
import { SectionCard } from "../components/SectionCard"
import { EmptyState } from "../components/EmptyState"
import type { DashboardState } from "../hooks/useDashboard"

interface LogsTabProps {
  dashboard: DashboardState
}

export const LogsTab = memo(function LogsTab({ dashboard }: LogsTabProps) {
  const { accessLogs, fetchAllData } = dashboard

  return (
    <div className="space-y-8">
      <SectionCard
        icon={ActivityIcon}
        title="OAuth2 Provider Scopes Access Audit"
        subtitle="Chronological immutable audit log of authentication handshakes."
        action={
          <Button
            variant="dark-action"
            onClick={fetchAllData}
            className="cursor-pointer rounded-xl px-3 py-1.5 text-xs"
          >
            Refresh Logs
          </Button>
        }
      >
        {accessLogs.length === 0 ? (
          <EmptyState message="No authorization events logged in this session." />
        ) : (
          <div className="relative ml-4 space-y-6 border-l border-zinc-800/80 pl-6">
            {accessLogs.map((log) => (
              <div key={log.id} className="relative space-y-2">
                <div className="absolute top-1.5 -left-[31px] h-3.5 w-3.5 rounded-full border border-blue-500 bg-zinc-950 ring-4 ring-zinc-900/50" />

                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                  <h4 className="text-sm font-bold text-zinc-200">
                    🔑 Grant Session Issued:{" "}
                    <span className="text-blue-400">{log.relying_party}</span>
                  </h4>
                  <span className="rounded-md border border-zinc-800 bg-zinc-950/60 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
                    {new Date(log.access_time).toLocaleString()}
                  </span>
                </div>

                <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
                  {log.scopes_accessed && log.scopes_accessed.length > 0 && (
                    <div>
                      <p className="mb-1.5 text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
                        Scopes Requested
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {log.scopes_accessed.map((sc) => (
                          <span
                            key={sc}
                            className="rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400"
                          >
                            {sc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {log.claims_returned && log.claims_returned.length > 0 && (
                    <div>
                      <p className="mb-1.5 text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
                        Returned Assertions (Claims)
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {log.claims_returned.map((cl) => (
                          <span
                            key={cl}
                            className="rounded-md border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-400"
                          >
                            {cl}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  )
})
