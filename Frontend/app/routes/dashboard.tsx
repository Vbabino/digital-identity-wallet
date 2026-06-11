import { useState } from "react"
import { redirect, useLoaderData } from "react-router"
import { api } from "~/services/api"
import { HugeiconsIcon } from "@hugeicons/react"
import { Tick01Icon, Cancel01Icon } from "@hugeicons/core-free-icons"
import { useDashboard } from "./dashboard/hooks/useDashboard"
import { Sidebar } from "./dashboard/components/Sidebar"
import { MobileNav } from "./dashboard/components/Sidebar"
import { CrudModal } from "./dashboard/components/CrudModal"
import { ConfirmDialog } from "./dashboard/components/ConfirmDialog"
import { PersonalTab } from "./dashboard/tabs/PersonalTab"
import { BirthTab } from "./dashboard/tabs/BirthTab"
import { ContactTab } from "./dashboard/tabs/ContactTab"
import { ProfessionalTab } from "./dashboard/tabs/ProfessionalTab"
import { CredentialsTab } from "./dashboard/tabs/CredentialsTab"
import { LogsTab } from "./dashboard/tabs/LogsTab"
import { SecurityTab } from "./dashboard/tabs/SecurityTab"
import type { DashboardLoaderData } from "./dashboard/types"

export async function clientLoader(): Promise<DashboardLoaderData> {
  try {
    const userRes = await api.get("/api/auth/user/")

    const [legalRes, ageRes, birthRes] = await Promise.allSettled([
      api.get("/api/wallet/legal-identities/"),
      api.get("/api/wallet/date-of-birth/"),
      api.get("/api/wallet/place-of-birth/"),
    ])

    const [
      addressesRes,
      nationalitiesRes,
      genderRes,
      profRes,
      onlineRes,
      dailyRes,
      credRes,
      customRes,
      logsRes,
    ] = await Promise.all([
      api.get("/api/wallet/addresses/"),
      api.get("/api/wallet/nationalities/"),
      api.get("/api/wallet/gender/"),
      api.get("/api/wallet/professionals/"),
      api.get("/api/wallet/online-profiles/"),
      api.get("/api/wallet/daily-uses/"),
      api.get("/api/wallet/credentials/"),
      api.get("/api/wallet/custom-objects/"),
      api.get("/api/wallet/access-logs/"),
    ])

    return {
      userEmail: userRes.data.email,
      legalIdentity: legalRes.status === "fulfilled" ? legalRes.value.data : null,
      age: ageRes.status === "fulfilled" ? ageRes.value.data : null,
      placeOfBirth: birthRes.status === "fulfilled" ? birthRes.value.data : null,
      addresses: addressesRes.data,
      nationalities: nationalitiesRes.data,
      genders: genderRes.data,
      professionals: profRes.data,
      onlineProfiles: onlineRes.data,
      dailyUses: dailyRes.data,
      credentials: credRes.data,
      customObjects: customRes.data,
      accessLogs: logsRes.data,
    }
  } catch {
    throw redirect("/login")
  }
}

const tabHeaders: Record<string, { title: string; subtitle: string }> = {
  personal: {
    title: "Legal & Personal Identity",
    subtitle: "Your official identity fields mapped to OAuth2/OIDC provider scopes.",
  },
  birth: {
    title: "Birth & Location Profile",
    subtitle: "Details pertaining to legal age bounds and registered birthplace.",
  },
  contact: {
    title: "Contact & Nationality Records",
    subtitle: "Registered physical addresses and primary nationality attributes.",
  },
  professional: {
    title: "Professional & Social Profiles",
    subtitle: "Employment details, online portfolio platform anchors, and daily aliases.",
  },
  credentials: {
    title: "Verified Identity Credentials",
    subtitle: "Official verified document credentials issued by third-party authorities.",
  },
  logs: {
    title: "Identity Security Access Log",
    subtitle: "Read-only historic log of scopes/claims requested by Relying Party apps.",
  },
  security: {
    title: "Security",
    subtitle: "Manage your account password.",
  },
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("personal")
  const loaderData = useLoaderData<typeof clientLoader>()
  const dashboard = useDashboard(loaderData)
  const { toast } = dashboard

  const header = tabHeaders[activeTab]

  return (
    <div className="flex min-h-svh overflow-hidden bg-zinc-950 font-sans text-zinc-100">
      <Sidebar
        activeTab={activeTab}
        userEmail={dashboard.userEmail}
        onTabChange={setActiveTab}
        onLogout={dashboard.handleLogout}
      />

      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        {/* Global Toast */}
        {toast && (
          <div className="fixed top-6 right-6 z-50 flex animate-bounce items-center space-x-2 rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-xs font-semibold shadow-2xl backdrop-blur-md">
            <HugeiconsIcon
              icon={toast.type === "success" ? Tick01Icon : Cancel01Icon}
              className={toast.type === "success" ? "h-4 w-4 text-green-400" : "h-4 w-4 text-red-400"}
            />
            <span className="text-zinc-200">{toast.message}</span>
          </div>
        )}

        {/* Header */}
        <header className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/10 px-8 py-5">
          <div className="flex items-center gap-4">
            <MobileNav
              activeTab={activeTab}
              userEmail={dashboard.userEmail}
              onTabChange={setActiveTab}
              onLogout={dashboard.handleLogout}
            />
            <div>
              <h2 className="font-heading text-2xl font-bold tracking-tight text-white">{header.title}</h2>
              <p className="mt-1 text-xs text-zinc-500">{header.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 rounded-full border border-zinc-800 bg-zinc-900/60 px-4 py-2 text-xs">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            <span className="font-semibold text-zinc-400">Vault Secure</span>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-4xl space-y-8 p-8">
          {activeTab === "personal" && <PersonalTab dashboard={dashboard} />}
          {activeTab === "birth" && <BirthTab dashboard={dashboard} />}
          {activeTab === "contact" && <ContactTab dashboard={dashboard} />}
          {activeTab === "professional" && <ProfessionalTab dashboard={dashboard} />}
          {activeTab === "credentials" && <CredentialsTab dashboard={dashboard} />}
          {activeTab === "logs" && <LogsTab dashboard={dashboard} />}
          {activeTab === "security" && <SecurityTab />}
        </div>
      </main>

      <CrudModal
        modalType={dashboard.modalType}
        modalAction={dashboard.modalAction}
        onSubmit={dashboard.handleMultiRecordSubmit}
        onClose={dashboard.closeModal}
        addressForm={dashboard.addressForm}
        setAddressForm={dashboard.setAddressForm}
        nationalityForm={dashboard.nationalityForm}
        setNationalityForm={dashboard.setNationalityForm}
        genderForm={dashboard.genderForm}
        setGenderForm={dashboard.setGenderForm}
        professionalForm={dashboard.professionalForm}
        setProfessionalForm={dashboard.setProfessionalForm}
        onlineForm={dashboard.onlineForm}
        setOnlineForm={dashboard.setOnlineForm}
        dailyForm={dashboard.dailyForm}
        setDailyForm={dashboard.setDailyForm}
        credentialForm={dashboard.credentialForm}
        setCredentialForm={dashboard.setCredentialForm}
        customForm={dashboard.customForm}
        setCustomForm={dashboard.setCustomForm}
      />

      <ConfirmDialog
        deleteConfirm={dashboard.deleteConfirm}
        onCancel={() => dashboard.setDeleteConfirm(null)}
        onConfirm={dashboard.confirmDelete}
      />
    </div>
  )
}
