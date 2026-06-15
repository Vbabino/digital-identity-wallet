import React, { memo } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar01Icon, Location01Icon, PencilEdit01Icon } from "@hugeicons/core-free-icons"
import { Button } from "~/components/ui/button"
import { SectionCard } from "../components/SectionCard"
import { PrivacyBadge } from "../components/PrivacyBadge"
import { countries, getCountryName } from "../types"
import type { Age, PlaceOfBirth } from "../types"
import type { DashboardState } from "../hooks/useDashboard"

interface BirthTabProps {
  dashboard: DashboardState
}

export const BirthTab = memo(function BirthTab({ dashboard }: BirthTabProps) {
  const {
    age,
    setAge,
    isEditingAge,
    setIsEditingAge,
    editAgeForm,
    setEditAgeForm,
    saveAge,
    placeOfBirth,
    setPlaceOfBirth,
    isEditingBirthPlace,
    setIsEditingBirthPlace,
    editBirthPlaceForm,
    setEditBirthPlaceForm,
    saveBirthPlace,
    toggleVisibility,
  } = dashboard

  return (
    <div className="space-y-8">
      {/* Date of Birth Singleton */}
      <SectionCard
        icon={Calendar01Icon}
        title="Date of Birth (Age Verification)"
        subtitle="Your birthdate mapped to the OIDC `birthdate` scope."
        action={
          age && !isEditingAge ? (
            <div className="flex items-center space-x-3">
              <PrivacyBadge
                visibility={age.visibility}
                onClick={() => toggleVisibility("date-of-birth", undefined, age.visibility, (updated) => setAge(updated as Age), true)}
              />
              <Button
                onClick={() => {
                  setEditAgeForm({ ...age })
                  setIsEditingAge(true)
                }}
                className="flex cursor-pointer items-center gap-1 rounded-xl border border-zinc-700/50 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-700"
              >
                <HugeiconsIcon icon={PencilEdit01Icon} className="h-3 w-3" /> Edit Field
              </Button>
            </div>
          ) : undefined
        }
      >
        {isEditingAge || !age ? (
          <form onSubmit={saveAge} className="space-y-4">
            {!age && (
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3.5 text-xs text-blue-300">
                📢 No Date of Birth record registered. Please provide yours.
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-zinc-400">Birth Date</label>
              <input
                type="date"
                required
                value={editAgeForm.birth_date}
                onChange={(e) => setEditAgeForm({ ...editAgeForm, birth_date: e.target.value })}
                className="mt-2 block w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-sm text-zinc-200 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400">Default Visibility</label>
              <select
                value={editAgeForm.visibility}
                onChange={(e) =>
                  setEditAgeForm({ ...editAgeForm, visibility: e.target.value as "public" | "private" })
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
                Save Date of Birth
              </Button>
              {age && (
                <Button
                  type="button"
                  onClick={() => setIsEditingAge(false)}
                  className="cursor-pointer rounded-xl border border-zinc-700/50 bg-zinc-800 px-4 py-2 text-xs text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        ) : (
          <div className="rounded-2xl border border-zinc-800/40 bg-zinc-950/30 p-5">
            <p className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">Birth Date</p>
            <p className="mt-1 text-lg font-bold text-zinc-100">{age.birth_date}</p>
            <p className="mt-2 text-xs text-zinc-500">
              Calculated age group and age-based assertions can be generated dynamically for verified relying parties.
            </p>
          </div>
        )}
      </SectionCard>

      {/* Place of Birth Singleton */}
      <SectionCard
        icon={Location01Icon}
        title="Registered Place of Birth"
        subtitle="Location of birth mapped to `birthplace` verification scopes."
        action={
          placeOfBirth && !isEditingBirthPlace ? (
            <div className="flex items-center space-x-3">
              <PrivacyBadge
                visibility={placeOfBirth.visibility}
                onClick={() =>
                  toggleVisibility("place-of-birth", undefined, placeOfBirth.visibility, (updated) => setPlaceOfBirth(updated as PlaceOfBirth), true)
                }
              />
              <Button
                onClick={() => {
                  setEditBirthPlaceForm({ ...placeOfBirth })
                  setIsEditingBirthPlace(true)
                }}
                className="flex cursor-pointer items-center gap-1 rounded-xl border border-zinc-700/50 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-700"
              >
                <HugeiconsIcon icon={PencilEdit01Icon} className="h-3 w-3" /> Edit Fields
              </Button>
            </div>
          ) : undefined
        }
      >
        {isEditingBirthPlace || !placeOfBirth ? (
          <form onSubmit={saveBirthPlace} className="space-y-4">
            {!placeOfBirth && (
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3.5 text-xs text-blue-300">
                📢 No Place of Birth record found. Fill out the fields to create one.
              </div>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-zinc-400">City</label>
                <input
                  type="text"
                  required
                  value={editBirthPlaceForm.birth_city}
                  onChange={(e) => setEditBirthPlaceForm({ ...editBirthPlaceForm, birth_city: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-400">State / Province</label>
                <input
                  type="text"
                  required
                  value={editBirthPlaceForm.birth_state}
                  onChange={(e) => setEditBirthPlaceForm({ ...editBirthPlaceForm, birth_state: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400">Country of Birth</label>
              <select
                value={editBirthPlaceForm.birth_country}
                onChange={(e) => setEditBirthPlaceForm({ ...editBirthPlaceForm, birth_country: e.target.value })}
                className="mt-2 block w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-sm text-zinc-200 outline-none"
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400">Default Visibility</label>
              <select
                value={editBirthPlaceForm.visibility}
                onChange={(e) =>
                  setEditBirthPlaceForm({ ...editBirthPlaceForm, visibility: e.target.value as "public" | "private" })
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
                Save Place of Birth
              </Button>
              {placeOfBirth && (
                <Button
                  type="button"
                  onClick={() => setIsEditingBirthPlace(false)}
                  className="cursor-pointer rounded-xl border border-zinc-700/50 bg-zinc-800 px-4 py-2 text-xs text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 gap-4 rounded-2xl border border-zinc-800/40 bg-zinc-950/30 p-5 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">City &amp; State</p>
              <p className="mt-1 text-sm font-semibold text-zinc-100">
                {placeOfBirth.birth_city}, {placeOfBirth.birth_state}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">Country</p>
              <p className="mt-1 text-sm font-semibold text-zinc-100">
                {getCountryName(placeOfBirth.birth_country)}
              </p>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  )
})
