import { cn } from "~/lib/utils"

interface EmptyStateProps {
  message: string
  size?: "sm" | "md"
}

export function EmptyState({ message, size = "md" }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/20 text-center text-zinc-500",
        size === "sm" ? "py-6 text-xs" : "py-8 text-sm"
      )}
    >
      {message}
    </div>
  )
}
