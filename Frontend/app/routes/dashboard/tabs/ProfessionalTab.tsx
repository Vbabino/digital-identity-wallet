import React, { memo } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Briefcase02Icon,
  GlobeIcon,
  UserCircleIcon,
  PencilEdit01Icon,
  Delete02Icon,
  Add01Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "~/components/ui/button"
import { SectionCard } from "../components/SectionCard"
import { EmptyState } from "../components/EmptyState"
import { PrivacyBadge } from "../components/PrivacyBadge"
import type { DashboardState } from "../hooks/useDashboard"

interface ProfessionalTabProps {
  dashboard: DashboardState
}

export const ProfessionalTab = memo(function ProfessionalTab({ dashboard }: ProfessionalTabProps) {
  const {
    professionals,
    setProfessionals,
    onlineProfiles,
    setOnlineProfiles,
    dailyUses,
    setDailyUses,
    openModal,
    handleDeleteRecord,
    toggleVisibility,
  } = dashboard

  return (
    <div className="space-y-8">
      {/* Professional Identity */}
      <SectionCard
        icon={Briefcase02Icon}
        title="Employment & Professional Identity"
        subtitle="Role records mapped to professional and employee scopes."
        action={
          <Button
            variant="gradient-primary"
            onClick={() => openModal("professional", "create")}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-medium"
          >
            <HugeiconsIcon icon={Add01Icon} className="h-3.5 w-3.5" /> Add Job Profile
          </Button>
        }
      >
        {professionals.length === 0 ? (
          <EmptyState message="No professional identity profiles registered." />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {professionals.map((prof) => (
              <div
                key={prof.id}
                className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/30 p-5 sm:flex-row sm:items-center"
              >
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-zinc-200">{prof.job_title}</h4>
                  {prof.employee_number && (
                    <p className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">
                      ID: {prof.employee_number}
                    </p>
                  )}
                  <p className="mt-1 text-sm font-medium text-zinc-500">{prof.role_description}</p>
                </div>
                <div className="flex w-full items-center justify-end space-x-4 border-t border-zinc-800/40 pt-3 sm:w-auto sm:border-t-0 sm:pt-0">
                  <PrivacyBadge
                    visibility={prof.visibility}
                    size="sm"
                    onClick={() =>
                      toggleVisibility("professionals", prof.id, prof.visibility, (updated) => {
                        setProfessionals(professionals.map((p) => (p.id === prof.id ? updated : p)))
                      })
                    }
                  />
                  <button
                    onClick={() => openModal("professional", "edit", prof)}
                    className="flex cursor-pointer items-center gap-0.5 text-xs font-medium text-zinc-400 hover:text-zinc-200"
                  >
                    <HugeiconsIcon icon={PencilEdit01Icon} className="h-3 w-3" /> Edit
                  </button>
                  <span className="hidden text-zinc-700 sm:inline">|</span>
                  <button
                    onClick={() => handleDeleteRecord("professionals", prof.id, setProfessionals, professionals)}
                    className="flex cursor-pointer items-center gap-0.5 text-xs font-medium text-red-400/80 hover:text-red-400"
                  >
                    <HugeiconsIcon icon={Delete02Icon} className="h-3 w-3" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Online Profiles & Daily Uses grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <SectionCard
          icon={GlobeIcon}
          title="Online Profiles"
          action={
            <Button
              variant="dark-action"
              onClick={() => openModal("online", "create")}
              className="flex cursor-pointer items-center gap-1 rounded-xl px-2.5 py-1 text-xs"
            >
              <HugeiconsIcon icon={Add01Icon} className="h-3 w-3" /> Add
            </Button>
          }
        >
          {onlineProfiles.length === 0 ? (
            <EmptyState message="No online profiles registered." size="sm" />
          ) : (
            <div className="space-y-4">
              {onlineProfiles.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col justify-between space-y-3 rounded-xl border border-zinc-800/50 bg-zinc-950/30 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold tracking-wider text-blue-400 uppercase">{p.platform}</p>
                      <p className="mt-1 text-sm font-semibold text-zinc-200">@{p.username}</p>
                      {p.display_name && (
                        <p className="text-xs font-medium text-zinc-500">{p.display_name}</p>
                      )}
                    </div>
                    <PrivacyBadge
                      visibility={p.visibility}
                      size="sm"
                      onClick={() =>
                        toggleVisibility("online-profiles", p.id, p.visibility, (updated) => {
                          setOnlineProfiles(onlineProfiles.map((item) => (item.id === p.id ? updated : item)))
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-end space-x-2 border-t border-zinc-900/50 pt-2">
                    <button
                      onClick={() => openModal("online", "edit", p)}
                      className="flex cursor-pointer items-center gap-0.5 text-[10px] font-semibold text-zinc-400 hover:text-zinc-200"
                    >
                      <HugeiconsIcon icon={PencilEdit01Icon} className="h-2.5 w-2.5" /> Edit
                    </button>
                    <span className="text-zinc-800">|</span>
                    <button
                      onClick={() => handleDeleteRecord("online-profiles", p.id, setOnlineProfiles, onlineProfiles)}
                      className="flex cursor-pointer items-center gap-0.5 text-[10px] font-semibold text-red-400/80 hover:text-red-400"
                    >
                      <HugeiconsIcon icon={Delete02Icon} className="h-2.5 w-2.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          icon={UserCircleIcon}
          title="Daily Aliases"
          action={
            <Button
              variant="dark-action"
              onClick={() => openModal("daily", "create")}
              className="flex cursor-pointer items-center gap-1 rounded-xl px-2.5 py-1 text-xs"
            >
              <HugeiconsIcon icon={Add01Icon} className="h-3 w-3" /> Add
            </Button>
          }
        >
          {dailyUses.length === 0 ? (
            <EmptyState message="No aliases registered." size="sm" />
          ) : (
            <div className="space-y-4">
              {dailyUses.map((d) => (
                <div
                  key={d.id}
                  className="flex flex-col justify-between space-y-3 rounded-xl border border-zinc-800/50 bg-zinc-950/30 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">Preferred Name</p>
                      <p className="mt-1 text-sm font-semibold text-zinc-200">{d.preferred_name || "—"}</p>
                      <p className="mt-2 text-xs font-semibold tracking-wider text-zinc-500 uppercase">Nickname</p>
                      <p className="mt-1 text-sm font-semibold text-zinc-200">"{d.nickname || "—"}"</p>
                    </div>
                    <PrivacyBadge
                      visibility={d.visibility}
                      size="sm"
                      onClick={() =>
                        toggleVisibility("daily-uses", d.id, d.visibility, (updated) => {
                          setDailyUses(dailyUses.map((item) => (item.id === d.id ? updated : item)))
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-end space-x-2 border-t border-zinc-900/50 pt-2">
                    <button
                      onClick={() => openModal("daily", "edit", d)}
                      className="flex cursor-pointer items-center gap-0.5 text-[10px] font-semibold text-zinc-400 hover:text-zinc-200"
                    >
                      <HugeiconsIcon icon={PencilEdit01Icon} className="h-2.5 w-2.5" /> Edit
                    </button>
                    <span className="text-zinc-800">|</span>
                    <button
                      onClick={() => handleDeleteRecord("daily-uses", d.id, setDailyUses, dailyUses)}
                      className="flex cursor-pointer items-center gap-0.5 text-[10px] font-semibold text-red-400/80 hover:text-red-400"
                    >
                      <HugeiconsIcon icon={Delete02Icon} className="h-2.5 w-2.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  )
})
