import React, { memo } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  HistoryIcon,
  Add01Icon,
  PencilEdit01Icon,
  Delete02Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "~/components/ui/button"
import { SectionCard } from "../components/SectionCard"
import { EmptyState } from "../components/EmptyState"
import { PrivacyBadge } from "../components/PrivacyBadge"
import type { NameHistory } from "../types"
import type { DashboardState } from "../hooks/useDashboard"

const NAME_HISTORY_PAGE_SIZE = 10

interface NameHistoryTabProps {
  dashboard: DashboardState
}

export const NameHistoryTab = memo(function NameHistoryTab({ dashboard }: NameHistoryTabProps) {
  const {
    nameHistories,
    setNameHistories,
    nameHistoriesPage,
    nameHistoriesCount,
    nameHistoriesHasNext,
    nameHistoriesHasPrevious,
    fetchNameHistoriesPage,
    openModal,
    handleDeleteRecord,
    toggleVisibility,
  } = dashboard
  const totalPages = Math.max(1, Math.ceil(nameHistoriesCount / NAME_HISTORY_PAGE_SIZE))

  return (
    <div className="space-y-8">
      <SectionCard
        icon={HistoryIcon}
        title="Chronological Name History"
        subtitle="Track legal name changes over time, mapped to `name_history` scope."
        action={
          <Button
            variant="gradient-primary"
            onClick={() => openModal("nameHistory", "create")}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-medium"
          >
            <HugeiconsIcon icon={Add01Icon} className="h-3.5 w-3.5" /> Add Entry
          </Button>
        }
      >
        {nameHistories.length === 0 ? (
          <EmptyState message="No name history entries recorded." />
        ) : (
          <div className="relative ml-4 space-y-6 border-l border-border/80 pl-6">
            {nameHistories.map((entry) => (
              <div key={entry.id} className="relative space-y-2">
                <div className="absolute top-1.5 -left-[31px] h-3.5 w-3.5 rounded-full border border-ring bg-background ring-4 ring-card/50" />

                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                  <h4 className="text-sm font-bold text-foreground">
                    {entry.given_name} {entry.middle_name} {entry.family_name}
                  </h4>
                  <span className="rounded-md border border-border bg-muted/60 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                    {new Date(entry.valid_from).toLocaleDateString()} –{" "}
                    {new Date(entry.valid_until).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex w-full items-center justify-end space-x-4 rounded-xl border border-border bg-muted/40 p-3">
                  <PrivacyBadge
                    visibility={entry.visibility}
                    size="sm"
                    onClick={() =>
                      toggleVisibility("name-histories", entry.id, entry.visibility, (updated) => {
                        setNameHistories(
                          nameHistories.map((n) => (n.id === entry.id ? (updated as NameHistory) : n))
                        )
                      })
                    }
                  />
                  <button
                    onClick={() => openModal("nameHistory", "edit", entry)}
                    className="flex cursor-pointer items-center gap-0.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    <HugeiconsIcon icon={PencilEdit01Icon} className="h-3 w-3" /> Edit
                  </button>
                  <span className="hidden text-border sm:inline">|</span>
                  <button
                    onClick={() =>
                      handleDeleteRecord("name-histories", entry.id, () =>
                        fetchNameHistoriesPage(nameHistoriesPage)
                      )
                    }
                    className="flex cursor-pointer items-center gap-0.5 text-xs font-medium text-red-400/80 hover:text-red-400"
                  >
                    <HugeiconsIcon icon={Delete02Icon} className="h-3 w-3" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {nameHistoriesCount > NAME_HISTORY_PAGE_SIZE && (
          <div className="mt-6 flex items-center justify-between border-t border-border/80 pt-4">
            <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
              Page {nameHistoriesPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                disabled={!nameHistoriesHasPrevious}
                onClick={() => fetchNameHistoriesPage(nameHistoriesPage - 1)}
                className="cursor-pointer rounded-xl px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} className="h-3.5 w-3.5" />
                Prev
              </Button>
              <Button
                variant="secondary"
                disabled={!nameHistoriesHasNext}
                onClick={() => fetchNameHistoriesPage(nameHistoriesPage + 1)}
                className="cursor-pointer rounded-xl px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <HugeiconsIcon icon={ArrowRight01Icon} className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  )
})
