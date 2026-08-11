import { HugeiconsIcon } from "@hugeicons/react"
import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons"
import { Button } from "~/components/ui/button"
import { useTheme } from "~/hooks/useTheme"
import { cn } from "~/lib/utils"

interface ThemeToggleProps {
  className?: string
  showLabel?: boolean
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === "dark"
  const label = isDark ? "Switch to light mode" : "Switch to dark mode"

  return (
    <Button
      type="button"
      variant="outline"
      size={showLabel ? "default" : "icon"}
      aria-label={label}
      onClick={toggleTheme}
      className={cn(showLabel && "gap-2", className)}
    >
      <HugeiconsIcon icon={isDark ? Sun03Icon : Moon02Icon} className="h-4 w-4" />
      {showLabel && <span>{label}</span>}
    </Button>
  )
}
