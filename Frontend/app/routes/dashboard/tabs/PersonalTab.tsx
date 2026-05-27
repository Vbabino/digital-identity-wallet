import React, { memo } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserIcon, UserCircleIcon, PencilEdit01Icon, Delete02Icon, Add01Icon } from "@hugeicons/core-free-icons"
import { Button } from "~/components/ui/button"
import { SectionCard } from "../components/SectionCard"
import { EmptyState } from "../components/EmptyState"
import { PrivacyBadge } from "../components/PrivacyBadge"
import type { DashboardState } from "../hooks/useDashboard"

interface PersonalTabProps {
  dashboard: DashboardState
}

export const PersonalTab = memo(function PersonalTab({ dashboard }: PersonalTabProps) {
  const {
    legalIdentity,
    isEditingLegal,
    setIsEditingLegal,
    editLegalForm,
    setEditLegalForm,
    saveLegalIdentity,
    toggleVisibility,
    setLegalIdentity,
    customObjects,
    setCustomObjects,
    openModal,
    handleDeleteRecord,
  } = dashboard

  return (
    <div className="space-y-8">
      {/* Legal Identity Singleton */}
      <SectionCard
        icon={UserIcon}
        title="Official Legal Identity"
        subtitle="Primary identification mapped to the `legal_name` scope."
        action={
          legalIdentity && !isEditingLegal ? (
            <div className="flex items-center space-x-3">
              <PrivacyBadge
                visibility={legalIdentity.visibility}
                onClick={() =>
                  toggleVisibility("legal-identities", undefined, legalIdentity.visibility, setLegalIdentity, true)
                }
              />
              <Button
                onClick={() => {
                  setEditLegalForm({ ...legalIdentity })
                  setIsEditingLegal(true)
                }}
                className="flex cursor-pointer items-center gap-1 rounded-xl border border-zinc-700/50 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-700"
              >
                <HugeiconsIcon icon={PencilEdit01Icon} className="h-3 w-3" /> Edit Fields
              </Button>
            </div>
          ) : undefined
        }
      >
        {isEditingLegal || !legalIdentity ? (
          <form onSubmit={saveLegalIdentity} className="space-y-4">
            {!legalIdentity && (
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3.5 text-xs text-blue-300">
                📢 No Legal Identity profile found. Fill out the fields below to create one.
              </div>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="text-xs font-semibold text-zinc-400">Given Name</label>
                <input
                  type="text"
                  required
                  value={editLegalForm.given_name}
                  onChange={(e) => setEditLegalForm({ ...editLegalForm, given_name: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-400">Middle Name</label>
                <input
                  type="text"
                  value={editLegalForm.middle_name || ""}
                  onChange={(e) => setEditLegalForm({ ...editLegalForm, middle_name: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-400">Family Name</label>
                <input
                  type="text"
                  required
                  value={editLegalForm.family_name}
                  onChange={(e) => setEditLegalForm({ ...editLegalForm, family_name: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-zinc-400">Given Name at Birth</label>
                <input
                  type="text"
                  value={editLegalForm.given_name_birth || ""}
                  onChange={(e) => setEditLegalForm({ ...editLegalForm, given_name_birth: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-400">Family Name at Birth</label>
                <input
                  type="text"
                  value={editLegalForm.family_name_birth || ""}
                  onChange={(e) => setEditLegalForm({ ...editLegalForm, family_name_birth: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400">Default Visibility</label>
              <select
                value={editLegalForm.visibility}
                onChange={(e) =>
                  setEditLegalForm({ ...editLegalForm, visibility: e.target.value as "public" | "private" })
                }
                className="mt-2 block w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-sm text-zinc-200 outline-none"
              >
                <option value="public">Public (Shared via Scope)</option>
                <option value="private">Private (Restricted)</option>
              </select>
            </div>
            <div className="flex items-center space-x-3 pt-2">
              <Button
                type="submit"
                className="cursor-pointer rounded-xl bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-zinc-200"
              >
                Save Legal Profile
              </Button>
              {legalIdentity && (
                <Button
                  type="button"
                  onClick={() => setIsEditingLegal(false)}
                  className="cursor-pointer rounded-xl border border-zinc-700/50 bg-zinc-800 px-4 py-2 text-xs text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 gap-6 rounded-2xl border border-zinc-800/40 bg-zinc-950/30 p-5 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">Full Legal Name</p>
                <p className="mt-1 text-base font-semibold text-zinc-100">
                  {legalIdentity.given_name} {legalIdentity.middle_name} {legalIdentity.family_name}
                </p>
              </div>
            </div>
            <div className="space-y-4 border-t border-zinc-800/60 pt-4 md:border-t-0 md:border-l md:pt-0 md:pl-6">
              <div>
                <p className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">Birth Identity Names</p>
                <p className="mt-1 text-sm font-medium text-zinc-300">
                  {legalIdentity.given_name_birth || "—"} {legalIdentity.family_name_birth || "—"} (Birth)
                </p>
              </div>
            </div>
          </div>
        )}
      </SectionCard>

      {/* Custom Extended Attributes */}
      <SectionCard
        icon={UserCircleIcon}
        title="Custom Extended Attributes"
        subtitle="Dynamically generated attributes exposed as `custom_name:*` scopes."
        action={
          <Button
            onClick={() => openModal("custom", "create")}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-3.5 py-1.5 text-xs font-medium text-white shadow-md shadow-blue-500/10 hover:from-blue-500 hover:to-violet-500"
          >
            <HugeiconsIcon icon={Add01Icon} className="h-3.5 w-3.5" /> Add Attribute
          </Button>
        }
      >
        {customObjects.length === 0 ? (
          <EmptyState message="No custom identity attributes registered." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {customObjects.map((attr) => (
              <div
                key={attr.id}
                className="flex flex-col justify-between space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950/30 p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="inline-block rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-blue-400 uppercase">
                      scope: custom_name:{attr.name_type}
                    </p>
                    <h4 className="mt-2 text-sm font-bold text-zinc-300">{attr.name_type.replace(/_/g, " ")}</h4>
                    <p className="mt-1 text-base font-semibold text-zinc-100">{attr.name_value}</p>
                  </div>
                  <PrivacyBadge
                    visibility={attr.visibility}
                    size="sm"
                    onClick={() =>
                      toggleVisibility("custom-objects", attr.id, attr.visibility, (updated) => {
                        setCustomObjects(customObjects.map((o) => (o.id === attr.id ? updated : o)))
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-end space-x-2 border-t border-zinc-800/40 pt-3">
                  <button
                    onClick={() => openModal("custom", "edit", attr)}
                    className="flex cursor-pointer items-center gap-0.5 text-xs font-medium text-zinc-400 hover:text-zinc-200"
                  >
                    <HugeiconsIcon icon={PencilEdit01Icon} className="h-3 w-3" /> Edit
                  </button>
                  <span className="text-zinc-700">|</span>
                  <button
                    onClick={() => handleDeleteRecord("custom-objects", attr.id, setCustomObjects, customObjects)}
                    className="flex cursor-pointer items-center gap-0.5 text-xs font-medium text-red-400/80 hover:text-red-400"
                  >
                    <HugeiconsIcon icon={Delete02Icon} className="h-3 w-3" /> Remove
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
