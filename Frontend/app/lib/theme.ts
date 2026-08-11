export const THEME_STORAGE_KEY = "theme"

export type Theme = "light" | "dark"

/** Reads the OS-level color scheme preference. */
export function getSystemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

/** Reads a previously persisted theme choice, if any. Never throws. */
export function getStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return stored === "light" || stored === "dark" ? stored : null
  } catch {
    return null
  }
}

/** Persisted choice wins; otherwise falls back to the OS preference. */
export function resolveInitialTheme(): Theme {
  return getStoredTheme() ?? getSystemTheme()
}

/** Toggles the `.dark` class on `<html>`, which drives every `dark:` variant and CSS token. */
export function applyThemeClass(theme: Theme): void {
  document.documentElement.classList.toggle("dark", theme === "dark")
}

/** Persists the theme choice so it survives reloads. Never throws. */
export function persistTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // storage unavailable (private browsing, quota, etc.) — theme just won't persist
  }
}
