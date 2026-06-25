import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMemoryRouter, RouterProvider } from "react-router"
import { http, HttpResponse } from "msw"
import ForgotPassword from "~/routes/forgot-password"
import { server } from "~/test/mocks/server"

function renderForgotPassword() {
  const router = createMemoryRouter(
    [
      { path: "/forgot-password", Component: ForgotPassword },
      { path: "/login", element: <div>Login</div> },
    ],
    { initialEntries: ["/forgot-password"] }
  )
  render(<RouterProvider router={router} />)
  return router
}

describe("Forgot Password page", () => {
  it("renders the email input and submit button", () => {
    renderForgotPassword()
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Send Reset Link/i })).toBeInTheDocument()
  })

  it("shows the 'Check your inbox' screen after submitting a valid email", async () => {
    renderForgotPassword()
    await userEvent.type(screen.getByPlaceholderText("you@example.com"), "user@example.com")
    await userEvent.click(screen.getByRole("button", { name: /Send Reset Link/i }))
    await waitFor(() =>
      expect(screen.getByText("Check your inbox")).toBeInTheDocument()
    )
    // Form should be hidden
    expect(screen.queryByPlaceholderText("you@example.com")).not.toBeInTheDocument()
  })

  it("shows the confirmation screen even for an unregistered email (prevents enumeration)", async () => {
    // The backend always returns 200 regardless of whether the email exists.
    // The handler already returns 200 by default, so no override needed.
    renderForgotPassword()
    await userEvent.type(
      screen.getByPlaceholderText("you@example.com"),
      "notregistered@example.com"
    )
    await userEvent.click(screen.getByRole("button", { name: /Send Reset Link/i }))
    await waitFor(() =>
      expect(screen.getByText("Check your inbox")).toBeInTheDocument()
    )
  })

  it("shows an error message when the API call fails", async () => {
    server.use(
      http.post("http://localhost/api/auth/password/reset/", () =>
        new HttpResponse(null, { status: 500 })
      )
    )
    renderForgotPassword()
    await userEvent.type(screen.getByPlaceholderText("you@example.com"), "user@example.com")
    await userEvent.click(screen.getByRole("button", { name: /Send Reset Link/i }))
    await waitFor(() =>
      expect(screen.getByText("Something went wrong. Please try again.")).toBeInTheDocument()
    )
    // Form stays visible
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument()
  })
})
