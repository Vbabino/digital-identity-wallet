import { render, screen, waitFor } from "@testing-library/react"
import { createMemoryRouter, RouterProvider } from "react-router"
import { http, HttpResponse } from "msw"
import VerifyEmail from "~/routes/verify-email"
import { server } from "~/test/mocks/server"

function renderVerifyEmail(search = "") {
  const router = createMemoryRouter(
    [
      { path: "/auth/verify-email", Component: VerifyEmail },
      { path: "/login", element: <div>Login</div> },
    ],
    { initialEntries: [`/auth/verify-email${search}`] }
  )
  render(<RouterProvider router={router} />)
  return router
}

describe("Verify Email page", () => {
  it("shows a loading spinner on mount while the request is in flight", () => {
    renderVerifyEmail("?key=abc123")
    expect(screen.getByText("Verifying your email…")).toBeInTheDocument()
  })

  it("shows the success screen when the key is valid", async () => {
    renderVerifyEmail("?key=abc123")
    await waitFor(() =>
      expect(screen.getByText("Email verified")).toBeInTheDocument()
    )
    expect(screen.getByText(/Go to sign in/i)).toBeInTheDocument()
  })

  it("shows the error screen when no key is present in the URL", async () => {
    renderVerifyEmail()
    await waitFor(() =>
      expect(screen.getByText("Verification failed")).toBeInTheDocument()
    )
    expect(
      screen.getByText("No verification key found in the URL.")
    ).toBeInTheDocument()
  })

  it("shows the error screen when the API rejects the key", async () => {
    server.use(
      http.post("http://localhost/api/auth/registration/verify-email/", () =>
        HttpResponse.json({ key: ["Invalid or expired key."] }, { status: 400 })
      )
    )
    renderVerifyEmail("?key=bad-key")
    await waitFor(() =>
      expect(screen.getByText("Verification failed")).toBeInTheDocument()
    )
    expect(screen.getByText("Invalid or expired key.")).toBeInTheDocument()
  })

  it("shows a fallback error message when the API error has no parseable detail", async () => {
    server.use(
      http.post("http://localhost/api/auth/registration/verify-email/", () =>
        new HttpResponse(null, { status: 500 })
      )
    )
    renderVerifyEmail("?key=abc123")
    await waitFor(() =>
      expect(screen.getByText("Verification failed")).toBeInTheDocument()
    )
    expect(
      screen.getByText("Verification failed. The link may have expired.")
    ).toBeInTheDocument()
  })
})
