import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMemoryRouter, RouterProvider, RouterContextProvider } from "react-router"
import { http, HttpResponse } from "msw"
import AuthCallback, { clientLoader } from "~/routes/auth-callback"
import { server } from "~/test/mocks/server"

// Helper: build the minimal args shape that clientLoader expects
function makeLoaderArgs(url: string) {
  return {
    request: new Request(url),
    params: {},
    url: new URL(url),
    pattern: "/auth/callback/google",
    context: new RouterContextProvider(),
    serverLoader: () => Promise.reject(new Error("serverLoader not available in this test")),
  }
}

// Helper: render the AuthCallback component with mock loader data
function renderCallback(loaderData: Record<string, unknown>) {
  const router = createMemoryRouter(
    [
      {
        path: "/auth/callback/google",
        loader: () => loaderData,
        Component: AuthCallback,
      },
      { path: "/login", element: <div>Login</div> },
      { path: "/dashboard", element: <div>Dashboard</div> },
    ],
    { initialEntries: ["/auth/callback/google"] }
  )
  render(<RouterProvider router={router} />)
  return router
}

describe("clientLoader", () => {
  beforeEach(() => sessionStorage.clear())

  it("returns an error when oauth_intent is missing from sessionStorage", async () => {
    const result = await clientLoader(
      makeLoaderArgs("http://localhost/auth/callback/google?code=abc&state=xyz")
    )
    expect(result).toMatchObject({ error: expect.stringContaining("missing") })
  })

  it("returns an error when the state parameter does not match", async () => {
    sessionStorage.setItem("oauth_state", "expected-state")
    sessionStorage.setItem("oauth_intent", "login")
    const result = await clientLoader(
      makeLoaderArgs("http://localhost/auth/callback/google?code=abc&state=WRONG")
    )
    expect(result).toMatchObject({ error: expect.stringContaining("state") })
  })

  it("returns an error when the code parameter is missing", async () => {
    sessionStorage.setItem("oauth_state", "mystate")
    sessionStorage.setItem("oauth_intent", "login")
    const result = await clientLoader(
      makeLoaderArgs("http://localhost/auth/callback/google?state=mystate")
    )
    expect(result).toMatchObject({ error: expect.stringContaining("code") })
  })

  it("clears sessionStorage after processing", async () => {
    sessionStorage.setItem("oauth_state", "mystate")
    sessionStorage.setItem("pkce_verifier", "myverifier")
    sessionStorage.setItem("oauth_intent", "login")
    await clientLoader(
      makeLoaderArgs("http://localhost/auth/callback/google?code=abc&state=mystate")
    )
    expect(sessionStorage.getItem("oauth_state")).toBeNull()
    expect(sessionStorage.getItem("pkce_verifier")).toBeNull()
    expect(sessionStorage.getItem("oauth_intent")).toBeNull()
  })

  it("returns a redirect to /dashboard for a successful login intent", async () => {
    sessionStorage.setItem("oauth_state", "mystate")
    sessionStorage.setItem("pkce_verifier", "myverifier")
    sessionStorage.setItem("oauth_intent", "login")
    const result = await clientLoader(
      makeLoaderArgs("http://localhost/auth/callback/google?code=abc&state=mystate")
    )
    expect(result instanceof Response).toBe(true)
    expect((result as Response).headers.get("Location")).toBe("/dashboard")
  })

  it("returns a redirect to /dashboard?social_connected=google for a successful connect intent", async () => {
    sessionStorage.setItem("oauth_state", "mystate")
    sessionStorage.setItem("pkce_verifier", "myverifier")
    sessionStorage.setItem("oauth_intent", "connect")
    const result = await clientLoader(
      makeLoaderArgs("http://localhost/auth/callback/google?code=abc&state=mystate")
    )
    expect(result instanceof Response).toBe(true)
    expect((result as Response).headers.get("Location")).toBe(
      "/dashboard?social_connected=google"
    )
  })

  it("returns an error object when the API call fails for login intent", async () => {
    server.use(
      http.post("http://localhost/api/auth/social/google/", () =>
        new HttpResponse(null, { status: 400 })
      )
    )
    sessionStorage.setItem("oauth_state", "mystate")
    sessionStorage.setItem("pkce_verifier", "myverifier")
    sessionStorage.setItem("oauth_intent", "login")
    const result = await clientLoader(
      makeLoaderArgs("http://localhost/auth/callback/google?code=abc&state=mystate")
    )
    expect(result).toMatchObject({ error: expect.any(String) })
    expect((result as { backTo?: string }).backTo).toBeUndefined()
  })

  it("returns an error with backTo=/dashboard when connect intent API fails", async () => {
    server.use(
      http.post("http://localhost/api/auth/social/google/connect/", () =>
        new HttpResponse(null, { status: 400 })
      )
    )
    sessionStorage.setItem("oauth_state", "mystate")
    sessionStorage.setItem("pkce_verifier", "myverifier")
    sessionStorage.setItem("oauth_intent", "connect")
    const result = await clientLoader(
      makeLoaderArgs("http://localhost/auth/callback/google?code=abc&state=mystate")
    )
    expect(result).toMatchObject({ error: expect.any(String), backTo: "/dashboard" })
  })
})

describe("AuthCallback component (error UI)", () => {
  it("renders 'Authentication Failed' title for login errors", async () => {
    renderCallback({ error: "Test authentication error" })
    await waitFor(() =>
      expect(screen.getByText("Authentication Failed")).toBeInTheDocument()
    )
    expect(screen.getByText("Test authentication error")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /Back to Sign In/i })
    ).toBeInTheDocument()
  })

  it("renders 'Connection Failed' title when backTo is set", async () => {
    renderCallback({
      error: "Google account already linked.",
      backTo: "/dashboard",
      backLabel: "Back to Dashboard",
    })
    await waitFor(() =>
      expect(screen.getByText("Connection Failed")).toBeInTheDocument()
    )
    expect(
      screen.getByRole("button", { name: /Back to Dashboard/i })
    ).toBeInTheDocument()
  })

  it("navigates to /login when Back to Sign In is clicked", async () => {
    const router = renderCallback({ error: "Auth error" })
    await waitFor(() =>
      expect(screen.getByText("Authentication Failed")).toBeInTheDocument()
    )
    await userEvent.click(screen.getByRole("button", { name: /Back to Sign In/i }))
    await waitFor(() => expect(router.state.location.pathname).toBe("/login"))
  })

  it("navigates to backTo when Back button is clicked for connect errors", async () => {
    const router = renderCallback({
      error: "Connect error",
      backTo: "/dashboard",
      backLabel: "Back to Dashboard",
    })
    await waitFor(() =>
      expect(screen.getByText("Connection Failed")).toBeInTheDocument()
    )
    await userEvent.click(screen.getByRole("button", { name: /Back to Dashboard/i }))
    await waitFor(() => expect(router.state.location.pathname).toBe("/dashboard"))
  })
})
