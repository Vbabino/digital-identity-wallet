import {
  THEME_STORAGE_KEY,
  getSystemTheme,
  getStoredTheme,
  resolveInitialTheme,
  applyThemeClass,
  persistTheme,
} from "~/lib/theme"

afterEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove("dark")
  vi.restoreAllMocks()
})

function mockMatchMedia(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({ matches } as MediaQueryList)
  )
}

describe("getSystemTheme", () => {
  it("returns dark when the OS prefers dark", () => {
    mockMatchMedia(true)
    expect(getSystemTheme()).toBe("dark")
  })

  it("returns light when the OS prefers light", () => {
    mockMatchMedia(false)
    expect(getSystemTheme()).toBe("light")
  })
})

describe("getStoredTheme", () => {
  it("returns null when nothing is stored", () => {
    expect(getStoredTheme()).toBeNull()
  })

  it("returns the stored theme when valid", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "dark")
    expect(getStoredTheme()).toBe("dark")
  })

  it("returns null for an invalid stored value", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "purple")
    expect(getStoredTheme()).toBeNull()
  })

  it("returns null instead of throwing when localStorage is unavailable", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage disabled")
    })
    expect(getStoredTheme()).toBeNull()
  })
})

describe("resolveInitialTheme", () => {
  it("prefers the stored value over the system preference", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "light")
    mockMatchMedia(true)
    expect(resolveInitialTheme()).toBe("light")
  })

  it("falls back to the system preference when nothing is stored", () => {
    mockMatchMedia(true)
    expect(resolveInitialTheme()).toBe("dark")
  })
})

describe("applyThemeClass", () => {
  it("adds the dark class for dark", () => {
    applyThemeClass("dark")
    expect(document.documentElement.classList.contains("dark")).toBe(true)
  })

  it("removes the dark class for light", () => {
    document.documentElement.classList.add("dark")
    applyThemeClass("light")
    expect(document.documentElement.classList.contains("dark")).toBe(false)
  })
})

describe("persistTheme", () => {
  it("writes the theme to localStorage", () => {
    persistTheme("dark")
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark")
  })

  it("does not throw when localStorage is unavailable", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage disabled")
    })
    expect(() => persistTheme("dark")).not.toThrow()
  })
})
