import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMemoryRouter, RouterProvider, type InitialEntry } from "react-router"
import { http, HttpResponse } from "msw"
import { vi } from "vitest"
import Login from "~/routes/login"
import { server } from "~/test/mocks/server"

function renderLogin(initialEntries: InitialEntry[] = ["/login"]) {
  const router = createMemoryRouter(
    [
      { path: "/login", Component: Login },
      { path: "/dashboard", element: <div data-testid="dashboard">Dashboard</div> },
    ],
    { initialEntries }
  )
  render(<RouterProvider router={router} />)
  return router
}

describe("Login page", () => {
  it("renders the email field, password field, and sign-in button", () => {
    renderLogin()
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument()
    // Use exact text to avoid matching "Sign In with Google"
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument()
  })

  it("shows the sign-in form and keeps it visible without input (HTML5 required enforced)", async () => {
    renderLogin()
    // happy-dom enforces the `required` attribute and will not fire the
    // submit event when fields are empty, so the form stays on screen.
    await userEvent.click(screen.getByRole("button", { name: "Sign In" }))
    // Form is still visible — did not navigate away
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument()
  })

  it("navigates to /dashboard on successful login without MFA", async () => {
    const router = renderLogin()
    await userEvent.type(screen.getByPlaceholderText("you@example.com"), "user@example.com")
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "password123")
    await userEvent.click(screen.getByRole("button", { name: "Sign In" }))
    await waitFor(() => expect(router.state.location.pathname).toBe("/dashboard"))
  })

  it("transitions to the MFA step when mfa_enabled is true", async () => {
    server.use(
      http.post("http://localhost/api/auth/login/", () =>
        HttpResponse.json({ mfa_enabled: true, ephemeral_token: "eph-tok", method: "app" })
      )
    )
    renderLogin()
    await userEvent.type(screen.getByPlaceholderText("you@example.com"), "user@example.com")
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "password123")
    await userEvent.click(screen.getByRole("button", { name: "Sign In" }))
    await waitFor(() =>
      expect(screen.getByText("Two-Factor Authentication")).toBeInTheDocument()
    )
  })

  it("navigates to /dashboard after successful MFA verification", async () => {
    server.use(
      http.post("http://localhost/api/auth/login/", () =>
        HttpResponse.json({ mfa_enabled: true, ephemeral_token: "eph-tok", method: "app" })
      )
    )
    const router = renderLogin()
    await userEvent.type(screen.getByPlaceholderText("you@example.com"), "user@example.com")
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "password123")
    await userEvent.click(screen.getByRole("button", { name: "Sign In" }))
    await waitFor(() =>
      expect(screen.getByText("Two-Factor Authentication")).toBeInTheDocument()
    )
    await userEvent.type(screen.getByPlaceholderText("000000"), "123456")
    await userEvent.click(screen.getByRole("button", { name: "Verify" }))
    await waitFor(() => expect(router.state.location.pathname).toBe("/dashboard"))
  })

  it("shows an error and stays on credentials step after wrong password", async () => {
    server.use(
      http.post("http://localhost/api/auth/login/", () =>
        new HttpResponse(null, { status: 401 })
      )
    )
    renderLogin()
    await userEvent.type(screen.getByPlaceholderText("you@example.com"), "bad@example.com")
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "wrongpassword")
    await userEvent.click(screen.getByRole("button", { name: "Sign In" }))
    await waitFor(() =>
      expect(screen.getByText(/Authentication failed/i)).toBeInTheDocument()
    )
    // Still on credentials step
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument()
  })

  it("shows an error after wrong MFA code", async () => {
    server.use(
      http.post("http://localhost/api/auth/login/", () =>
        HttpResponse.json({ mfa_enabled: true, ephemeral_token: "eph-tok", method: "app" })
      ),
      http.post("http://localhost/api/auth/login/verify/", () =>
        new HttpResponse(null, { status: 400 })
      )
    )
    renderLogin()
    await userEvent.type(screen.getByPlaceholderText("you@example.com"), "user@example.com")
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "password123")
    await userEvent.click(screen.getByRole("button", { name: "Sign In" }))
    await waitFor(() =>
      expect(screen.getByText("Two-Factor Authentication")).toBeInTheDocument()
    )
    await userEvent.type(screen.getByPlaceholderText("000000"), "000000")
    await userEvent.click(screen.getByRole("button", { name: "Verify" }))
    await waitFor(() => expect(screen.getByText("Invalid code. Please try again.")).toBeInTheDocument())
  })

  it("calls the resend endpoint and shows a status message", async () => {
    server.use(
      http.post("http://localhost/api/auth/login/", () =>
        HttpResponse.json({ mfa_enabled: true, ephemeral_token: "eph-tok", method: "email" })
      )
    )
    renderLogin()
    await userEvent.type(screen.getByPlaceholderText("you@example.com"), "user@example.com")
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "password123")
    await userEvent.click(screen.getByRole("button", { name: "Sign In" }))
    await waitFor(() =>
      expect(screen.getByText("Two-Factor Authentication")).toBeInTheDocument()
    )
    await userEvent.click(screen.getByRole("button", { name: /Resend code/i }))
    await waitFor(() =>
      expect(screen.getByText("Code resent — check your email.")).toBeInTheDocument()
    )
  })

  it("shows the Back to sign in button on the MFA step", async () => {
    server.use(
      http.post("http://localhost/api/auth/login/", () =>
        HttpResponse.json({ mfa_enabled: true, ephemeral_token: "eph-tok", method: "app" })
      )
    )
    renderLogin()
    await userEvent.type(screen.getByPlaceholderText("you@example.com"), "user@example.com")
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "password123")
    await userEvent.click(screen.getByRole("button", { name: "Sign In" }))
    await waitFor(() =>
      expect(screen.getByText("Two-Factor Authentication")).toBeInTheDocument()
    )
    const backBtn = screen.getByRole("button", { name: /Back to sign in/i })
    await userEvent.click(backBtn)
    // Should return to credentials step
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument()
  })

  it("shows an error when switching MFA methods fails", async () => {
    server.use(
      http.post("http://localhost/api/auth/login/", () =>
        HttpResponse.json({ mfa_enabled: true, ephemeral_token: "eph-tok", method: "app" })
      ),
      http.post("http://localhost/api/auth/login/change-method/", () =>
        new HttpResponse(null, { status: 500 })
      )
    )
    renderLogin()
    await userEvent.type(screen.getByPlaceholderText("you@example.com"), "user@example.com")
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "password123")
    await userEvent.click(screen.getByRole("button", { name: "Sign In" }))
    await waitFor(() =>
      expect(screen.getByText("Two-Factor Authentication")).toBeInTheDocument()
    )
    // "Email" switcher button — switches from "app" method to "email"
    await userEvent.click(screen.getByRole("button", { name: /Email/i }))
    await waitFor(() =>
      expect(screen.getByText("Could not switch method. Please try again.")).toBeInTheDocument()
    )
  })

  it("shows a notice banner when navigated with router state", () => {
    renderLogin([{ pathname: "/login", search: "", hash: "", state: { notice: "Password updated." } }])
    expect(screen.getByText("Password updated.")).toBeInTheDocument()
  })

  afterEach(() => vi.restoreAllMocks())
})
