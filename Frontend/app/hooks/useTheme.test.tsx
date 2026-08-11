import { renderHook, act } from "@testing-library/react"
import type { ReactNode } from "react"
import { ThemeProvider, useTheme } from "~/hooks/useTheme"
import { THEME_STORAGE_KEY } from "~/lib/theme"

function wrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>
}

afterEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove("dark")
})

describe("useTheme", () => {
  it("throws when used outside a ThemeProvider", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(() => renderHook(() => useTheme())).toThrow(
      "useTheme must be used within a ThemeProvider"
    )
    consoleSpy.mockRestore()
  })

  it("resolves the initial theme from a stored value", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "dark")
    const { result } = renderHook(() => useTheme(), { wrapper })
    expect(result.current.theme).toBe("dark")
    expect(document.documentElement.classList.contains("dark")).toBe(true)
  })

  it("toggleTheme flips the theme and updates the .dark class + localStorage", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "light")
    const { result } = renderHook(() => useTheme(), { wrapper })
    expect(result.current.theme).toBe("light")

    act(() => result.current.toggleTheme())

    expect(result.current.theme).toBe("dark")
    expect(document.documentElement.classList.contains("dark")).toBe(true)
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark")

    act(() => result.current.toggleTheme())

    expect(result.current.theme).toBe("light")
    expect(document.documentElement.classList.contains("dark")).toBe(false)
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light")
  })
})
