import React, { memo } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar01Icon, Location01Icon, PencilEdit01Icon } from "@hugeicons/core-free-icons"
import { Button } from "~/components/ui/button"
import { SectionCard } from "../components/SectionCard"
import { PrivacyBadge } from "../components/PrivacyBadge"
import { getCountryName, countryCodeToFlag } from "../types"
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
    countries,
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
                className="flex cursor-pointer items-center gap-1 rounded-xl border border-input bg-secondary px-3 py-1.5 text-xs text-secondary-foreground hover:bg-secondary/80"
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
              <label className="text-xs font-semibold text-muted-foreground">Birth Date</label>
              <input
                type="date"
                required
                value={editAgeForm.birth_date}
                onChange={(e) => setEditAgeForm({ ...editAgeForm, birth_date: e.target.value })}
                className="mt-2 block w-full rounded-xl border border-border bg-input/30 px-3 py-2 text-sm text-foreground outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Default Visibility</label>
              <select
                value={editAgeForm.visibility}
                onChange={(e) =>
                  setEditAgeForm({ ...editAgeForm, visibility: e.target.value as "public" | "private" })
                }
                className="mt-2 block w-full rounded-xl border border-border bg-input/30 px-3 py-2 text-sm text-foreground outline-none"
              >
                <option value="public">Public (Shared via Scope)</option>
                <option value="private">Private (Restricted)</option>
              </select>
            </div>
            <div className="flex items-center space-x-3 pt-2">
              <Button
                type="submit"
                className="cursor-pointer rounded-xl bg-foreground px-4 py-2 text-xs font-semibold text-background hover:bg-foreground/90"
              >
                Save Date of Birth
              </Button>
              {age && (
                <Button
                  type="button"
                  onClick={() => setIsEditingAge(false)}
                  className="cursor-pointer rounded-xl border border-input bg-secondary px-4 py-2 text-xs text-secondary-foreground hover:bg-secondary/80"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        ) : (
          <div className="rounded-2xl border border-border/40 bg-muted/30 p-5">
            <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Birth Date</p>
            <p className="mt-1 text-lg font-bold text-foreground">{age.birth_date}</p>
            <p className="mt-2 text-xs text-muted-foreground">
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
                className="flex cursor-pointer items-center gap-1 rounded-xl border border-input bg-secondary px-3 py-1.5 text-xs text-secondary-foreground hover:bg-secondary/80"
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
                <label className="text-xs font-semibold text-muted-foreground">City</label>
                <input
                  type="text"
                  required
                  value={editBirthPlaceForm.birth_city}
                  onChange={(e) => setEditBirthPlaceForm({ ...editBirthPlaceForm, birth_city: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-border bg-input/30 px-3 py-2 text-sm text-foreground outline-none focus:border-ring"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">State / Province</label>
                <input
                  type="text"
                  value={editBirthPlaceForm.birth_state}
                  onChange={(e) => setEditBirthPlaceForm({ ...editBirthPlaceForm, birth_state: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-border bg-input/30 px-3 py-2 text-sm text-foreground outline-none focus:border-ring"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Country of Birth</label>
              <select
                value={editBirthPlaceForm.birth_country}
                onChange={(e) => setEditBirthPlaceForm({ ...editBirthPlaceForm, birth_country: e.target.value })}
                className="mt-2 block w-full rounded-xl border border-border bg-input/30 px-3 py-2 text-sm text-foreground outline-none"
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>{countryCodeToFlag(c.code)} {c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Default Visibility</label>
              <select
                value={editBirthPlaceForm.visibility}
                onChange={(e) =>
                  setEditBirthPlaceForm({ ...editBirthPlaceForm, visibility: e.target.value as "public" | "private" })
                }
                className="mt-2 block w-full rounded-xl border border-border bg-input/30 px-3 py-2 text-sm text-foreground outline-none"
              >
                <option value="public">Public (Shared via Scope)</option>
                <option value="private">Private (Restricted)</option>
              </select>
            </div>
            <div className="flex items-center space-x-3 pt-2">
              <Button
                type="submit"
                className="cursor-pointer rounded-xl bg-foreground px-4 py-2 text-xs font-semibold text-background hover:bg-foreground/90"
              >
                Save Place of Birth
              </Button>
              {placeOfBirth && (
                <Button
                  type="button"
                  onClick={() => setIsEditingBirthPlace(false)}
                  className="cursor-pointer rounded-xl border border-input bg-secondary px-4 py-2 text-xs text-secondary-foreground hover:bg-secondary/80"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 gap-4 rounded-2xl border border-border/40 bg-muted/30 p-5 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">City &amp; State</p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {[placeOfBirth.birth_city, placeOfBirth.birth_state].filter(Boolean).join(", ")}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Country</p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {getCountryName(placeOfBirth.birth_country, countries)}
              </p>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  )
})
