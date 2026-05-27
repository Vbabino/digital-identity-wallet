import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserIcon,
  Calendar01Icon,
  Location01Icon,
  Briefcase02Icon,
  ShieldIcon,
  ActivityIcon,
  Logout01Icon,
  LockIcon,
  Menu01Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "~/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet"

const sidebarTabs = [
  { id: "personal", label: "Legal & Personal", icon: UserIcon },
  { id: "birth", label: "Birth & Location", icon: Calendar01Icon },
  { id: "contact", label: "Contact & Nationality", icon: Location01Icon },
  { id: "professional", label: "Professional & Social", icon: Briefcase02Icon },
  { id: "credentials", label: "Verified Credentials", icon: ShieldIcon },
  { id: "logs", label: "Security Logs", icon: ActivityIcon },
]

interface SidebarProps {
  activeTab: string
  userEmail: string
  onTabChange: (tab: string) => void
  onLogout: () => void
}

function NavContent({
  activeTab,
  userEmail,
  onTabChange,
  onLogout,
  onNavClick,
}: SidebarProps & { onNavClick?: () => void }) {
  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-violet-600 shadow-md shadow-blue-500/10">
            <HugeiconsIcon icon={LockIcon} className="h-5 w-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text font-heading text-xl font-bold text-transparent">
            TrustVault
          </span>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/30 p-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-sm font-bold text-white shadow-inner">
              {userEmail.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                Identified As
              </p>
              <p className="mt-0.5 truncate text-sm font-semibold text-zinc-200">{userEmail}</p>
            </div>
          </div>
        </div>

        <nav className="space-y-1">
          {sidebarTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                onTabChange(tab.id)
                onNavClick?.()
              }}
              className={`flex w-full cursor-pointer items-center space-x-3 rounded-xl px-4 py-3 text-sm font-medium transition duration-200 ${
                activeTab === tab.id
                  ? "bg-zinc-800 text-white shadow-lg"
                  : "text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200"
              }`}
            >
              <HugeiconsIcon icon={tab.icon} className="h-5 w-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-center gap-2 rounded-xl border border-zinc-800/50 bg-zinc-950/20 p-3.5 text-center text-xs text-zinc-500">
          <HugeiconsIcon icon={LockIcon} className="h-4 w-4 text-zinc-500" />
          Hardware Encrypted Vault
        </div>
        <Button
          variant="dark-action"
          onClick={onLogout}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-2.5 text-sm text-zinc-300 transition duration-200 hover:text-red-400"
        >
          <HugeiconsIcon icon={Logout01Icon} className="h-4 w-4" /> Close Vault Session
        </Button>
      </div>
    </>
  )
}

export function Sidebar({ activeTab, userEmail, onTabChange, onLogout }: SidebarProps) {
  return (
    <aside className="hidden w-80 flex-col justify-between border-r border-zinc-800/80 bg-zinc-900/40 p-6 md:flex">
      <NavContent
        activeTab={activeTab}
        userEmail={userEmail}
        onTabChange={onTabChange}
        onLogout={onLogout}
      />
    </aside>
  )
}

export function MobileNav({ activeTab, userEmail, onTabChange, onLogout }: SidebarProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            aria-label="Open navigation"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
          >
            <HugeiconsIcon icon={Menu01Icon} className="h-5 w-5" />
          </button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="flex w-80 flex-col justify-between border-r border-zinc-800/80 bg-zinc-900 p-6"
        >
          <NavContent
            activeTab={activeTab}
            userEmail={userEmail}
            onTabChange={onTabChange}
            onLogout={onLogout}
            onNavClick={() => setOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}
