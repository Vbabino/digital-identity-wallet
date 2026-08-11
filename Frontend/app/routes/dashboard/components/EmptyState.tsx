import { cn } from "~/lib/utils"

interface EmptyStateProps {
  message: string
  size?: "sm" | "md"
}

export function EmptyState({ message, size = "md" }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-border bg-muted/20 text-center text-muted-foreground",
        size === "sm" ? "py-6 text-xs" : "py-8 text-sm"
      )}
    >
      {message}
    </div>
  )
}
