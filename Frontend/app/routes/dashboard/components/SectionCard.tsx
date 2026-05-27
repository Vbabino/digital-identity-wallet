import { HugeiconsIcon } from "@hugeicons/react"
import type { ReactNode } from "react"

interface SectionCardProps {
  icon: any
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
}

export function SectionCard({ icon, title, subtitle, action, children }: SectionCardProps) {
  return (
    <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-xl">
      <div className="mb-6 flex items-center justify-between border-b border-zinc-800/60 pb-4">
        <div className="flex items-center space-x-3">
          <HugeiconsIcon icon={icon} className="h-6 w-6 text-zinc-400" />
          <div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-zinc-500">{subtitle}</p>}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  )
}
