import { HugeiconsIcon } from "@hugeicons/react"
import { GlobeIcon, LockIcon } from "@hugeicons/core-free-icons"
import { cn } from "~/lib/utils"

interface PrivacyBadgeProps {
  visibility: "public" | "private"
  onClick: () => void
  size?: "sm" | "md"
}

export function PrivacyBadge({ visibility, onClick, size = "md" }: PrivacyBadgeProps) {
  const isPublic = visibility === "public"
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex cursor-pointer items-center space-x-1.5 rounded-full border font-semibold transition",
        isPublic
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
          : "border-violet-500/30 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20",
        size === "sm" ? "px-2.5 py-0.5 text-[10px]" : "px-3 py-1.5 text-xs"
      )}
    >
      <HugeiconsIcon
        icon={isPublic ? GlobeIcon : LockIcon}
        className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"}
      />
      <span>{isPublic ? "Public" : "Private"}</span>
    </button>
  )
}
