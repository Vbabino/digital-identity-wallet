import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMemoryRouter, RouterProvider } from "react-router"
import { http, HttpResponse } from "msw"
import ResetPassword from "~/routes/reset-password"
import { server } from "~/test/mocks/server"

function renderResetPassword(search = "") {
  const router = createMemoryRouter(
    [
      { path: "/auth/reset-password", Component: ResetPassword },
      { path: "/login", element: <div data-testid="login-page">Login</div> },
      { path: "/forgot-password", element: <div>Forgot Password</div> },
    ],
    { initialEntries: [`/auth/reset-password${search}`] }
  )
  render(<RouterProvider router={router} />)
  return router
}

describe("Reset Password page", () => {
  it("shows an 'Invalid reset link' error when uid or token params are missing", () => {
    renderResetPassword()
    expect(screen.getByText("Invalid reset link")).toBeInTheDocument()
  })

  it("renders the password form when uid and token are present", () => {
    renderResetPassword("?uid=abc&token=xyz")
    expect(screen.getAllByPlaceholderText("••••••••")).toHaveLength(2)
    expect(screen.getByRole("button", { name: /Update Password/i })).toBeInTheDocument()
  })

  it("shows an error when the two passwords do not match", async () => {
    renderResetPassword("?uid=abc&token=xyz")
    const [pass1, pass2] = screen.getAllByPlaceholderText("••••••••")
    await userEvent.type(pass1, "NewPass1!")
    await userEvent.type(pass2, "DifferentPass!")
    await userEvent.click(screen.getByRole("button", { name: /Update Password/i }))
    await waitFor(() =>
      expect(screen.getByText("Passwords do not match.")).toBeInTheDocument()
    )
  })

  it("navigates to /login with a success notice after a successful password reset", async () => {
    const router = renderResetPassword("?uid=abc&token=xyz")
    const [pass1, pass2] = screen.getAllByPlaceholderText("••••••••")
    await userEvent.type(pass1, "NewStrongPass1!")
    await userEvent.type(pass2, "NewStrongPass1!")
    await userEvent.click(screen.getByRole("button", { name: /Update Password/i }))
    await waitFor(() => expect(router.state.location.pathname).toBe("/login"))
    expect((router.state.location.state as { notice?: string })?.notice).toBe(
      "Password updated. You can now sign in."
    )
  })

  it("shows API validation errors (e.g. weak password)", async () => {
    server.use(
      http.post("http://localhost/api/auth/password/reset/confirm/", () =>
        HttpResponse.json(
          { new_password1: ["This password is too common."] },
          { status: 400 }
        )
      )
    )
    renderResetPassword("?uid=abc&token=xyz")
    const [pass1, pass2] = screen.getAllByPlaceholderText("••••••••")
    await userEvent.type(pass1, "password")
    await userEvent.type(pass2, "password")
    await userEvent.click(screen.getByRole("button", { name: /Update Password/i }))
    await waitFor(() =>
      expect(screen.getByText("This password is too common.")).toBeInTheDocument()
    )
  })
})
