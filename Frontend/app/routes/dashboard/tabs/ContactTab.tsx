import React, { memo } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Location01Icon,
  GlobeIcon,
  UserIcon,
  PencilEdit01Icon,
  Delete02Icon,
  Add01Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "~/components/ui/button"
import { SectionCard } from "../components/SectionCard"
import { EmptyState } from "../components/EmptyState"
import { PrivacyBadge } from "../components/PrivacyBadge"
import { getCountryName } from "../types"
import type { Address, Nationality, Gender } from "../types"
import type { DashboardState } from "../hooks/useDashboard"

interface ContactTabProps {
  dashboard: DashboardState
}

export const ContactTab = memo(function ContactTab({ dashboard }: ContactTabProps) {
  const {
    addresses,
    setAddresses,
    nationalities,
    setNationalities,
    genders,
    setGenders,
    openModal,
    handleDeleteRecord,
    toggleVisibility,
    countries,
  } = dashboard

  return (
    <div className="space-y-8">
      {/* Addresses */}
      <SectionCard
        icon={Location01Icon}
        title="Residential Addresses"
        subtitle="Physical home, work, or mailing addresses mapped to `address` scopes."
        action={
          <Button
            variant="gradient-primary"
            onClick={() => openModal("address", "create")}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-medium"
          >
            <HugeiconsIcon icon={Add01Icon} className="h-3.5 w-3.5" /> Add Address
          </Button>
        }
      >
        {addresses.length === 0 ? (
          <EmptyState message="No residential addresses registered." />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-muted/30 p-5 sm:flex-row sm:items-center"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="rounded-md border border-input bg-secondary px-2 py-0.5 text-[10px] font-bold tracking-wider text-secondary-foreground uppercase">
                      {addr.address_type}
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {addr.resident_house_number} {addr.resident_street}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {addr.resident_city}, {addr.resident_state} {addr.resident_postal_code}
                  </p>
                  <p className="text-xs font-medium text-muted-foreground">{getCountryName(addr.resident_country, countries)}</p>
                </div>
                <div className="flex w-full items-center justify-end space-x-4 border-t border-border/40 pt-3 sm:w-auto sm:border-t-0 sm:pt-0">
                  <PrivacyBadge
                    visibility={addr.visibility}
                    size="sm"
                    onClick={() =>
                      toggleVisibility("addresses", addr.id, addr.visibility, (updated) => {
                        setAddresses(addresses.map((a) => (a.id === addr.id ? updated as Address : a)))
                      })
                    }
                  />
                  <button
                    onClick={() => openModal("address", "edit", addr)}
                    className="flex cursor-pointer items-center gap-0.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    <HugeiconsIcon icon={PencilEdit01Icon} className="h-3 w-3" /> Edit
                  </button>
                  <span className="hidden text-border sm:inline">|</span>
                  <button
                    onClick={() => handleDeleteRecord("addresses", addr.id, () => setAddresses(prev => prev.filter(a => a.id !== addr.id)))}
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

      {/* Nationalities & Genders grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <SectionCard
          icon={GlobeIcon}
          title="Nationalities"
          action={
            <Button
              variant="secondary"
              onClick={() => openModal("nationality", "create")}
              className="flex cursor-pointer items-center gap-1 rounded-xl px-2.5 py-1 text-xs"
            >
              <HugeiconsIcon icon={Add01Icon} className="h-3 w-3" /> Add
            </Button>
          }
        >
          {nationalities.length === 0 ? (
            <EmptyState message="No nationality records registered." size="sm" />
          ) : (
            <div className="space-y-3">
              {nationalities.map((nat) => (
                <div
                  key={nat.id}
                  className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/30 p-3"
                >
                  <span className="text-sm font-medium text-muted-foreground">{getCountryName(nat.nationality, countries)}</span>
                  <div className="flex items-center space-x-3">
                    <PrivacyBadge
                      visibility={nat.visibility}
                      size="sm"
                      onClick={() =>
                        toggleVisibility("nationalities", nat.id, nat.visibility, (updated) => {
                          setNationalities(nationalities.map((n) => (n.id === nat.id ? updated as Nationality : n)))
                        })
                      }
                    />
                    <button
                      onClick={() => handleDeleteRecord("nationalities", nat.id, () => setNationalities(prev => prev.filter(n => n.id !== nat.id)))}
                      className="cursor-pointer text-xs font-medium text-red-400/80 hover:text-red-400"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          icon={UserIcon}
          title="Gender Info"
          action={
            <Button
              variant="secondary"
              onClick={() => openModal("gender", "create")}
              className="flex cursor-pointer items-center gap-1 rounded-xl px-2.5 py-1 text-xs"
            >
              <HugeiconsIcon icon={Add01Icon} className="h-3 w-3" /> Add
            </Button>
          }
        >
          {genders.length === 0 ? (
            <EmptyState message="No gender records registered." size="sm" />
          ) : (
            <div className="space-y-3">
              {genders.map((gen) => (
                <div
                  key={gen.id}
                  className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/30 p-3"
                >
                  <span className="text-sm font-medium text-muted-foreground capitalize">{gen.gender}</span>
                  <div className="flex items-center space-x-3">
                    <PrivacyBadge
                      visibility={gen.visibility}
                      size="sm"
                      onClick={() =>
                        toggleVisibility("gender", gen.id, gen.visibility, (updated) => {
                          setGenders(genders.map((g) => (g.id === gen.id ? updated as Gender : g)))
                        })
                      }
                    />
                    <button
                      onClick={() => handleDeleteRecord("gender", gen.id, () => setGenders(prev => prev.filter(g => g.id !== gen.id)))}
                      className="cursor-pointer text-xs font-medium text-red-400/80 hover:text-red-400"
                    >
                      ✕
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
