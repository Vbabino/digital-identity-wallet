import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ThemeToggle } from "~/components/ThemeToggle"
import { ThemeProvider } from "~/hooks/useTheme"
import { THEME_STORAGE_KEY } from "~/lib/theme"

afterEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove("dark")
})

function renderToggle(props?: { showLabel?: boolean }) {
  return render(
    <ThemeProvider>
      <ThemeToggle {...props} />
    </ThemeProvider>
  )
}

describe("ThemeToggle", () => {
  it("shows a 'switch to dark' label when currently light", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "light")
    renderToggle()
    expect(screen.getByRole("button", { name: "Switch to dark mode" })).toBeInTheDocument()
  })

  it("shows a 'switch to light' label when currently dark", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "dark")
    renderToggle()
    expect(screen.getByRole("button", { name: "Switch to light mode" })).toBeInTheDocument()
  })

  it("toggles the theme and updates the .dark class on click", async () => {
    localStorage.setItem(THEME_STORAGE_KEY, "light")
    renderToggle()
    const button = screen.getByRole("button", { name: "Switch to dark mode" })

    await userEvent.click(button)

    expect(document.documentElement.classList.contains("dark")).toBe(true)
    expect(screen.getByRole("button", { name: "Switch to light mode" })).toBeInTheDocument()
  })

  it("renders a visible label when showLabel is true", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "light")
    renderToggle({ showLabel: true })
    expect(screen.getByText("Switch to dark mode")).toBeInTheDocument()
  })
})
