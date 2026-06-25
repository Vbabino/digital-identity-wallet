import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMemoryRouter, RouterProvider } from "react-router"
import { http, HttpResponse } from "msw"
import Register from "~/routes/register"
import { server } from "~/test/mocks/server"

function renderRegister() {
  const router = createMemoryRouter(
    [
      { path: "/register", Component: Register },
      { path: "/login", element: <div>Login</div> },
    ],
    { initialEntries: ["/register"] }
  )
  render(<RouterProvider router={router} />)
  return router
}

describe("Register page", () => {
  it("renders email, password, and confirm password fields", () => {
    renderRegister()
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument()
    const passwordFields = screen.getAllByPlaceholderText("••••••••")
    expect(passwordFields).toHaveLength(2)
  })

  it("shows 'Check your inbox' confirmation screen on success", async () => {
    renderRegister()
    await userEvent.type(screen.getByPlaceholderText("you@example.com"), "new@example.com")
    const [pass1, pass2] = screen.getAllByPlaceholderText("••••••••")
    await userEvent.type(pass1, "StrongPass1!")
    await userEvent.type(pass2, "StrongPass1!")
    await userEvent.click(screen.getByRole("button", { name: /Create Account/i }))
    await waitFor(() =>
      expect(screen.getByText("Check your inbox")).toBeInTheDocument()
    )
    // Form should be hidden
    expect(screen.queryByPlaceholderText("you@example.com")).not.toBeInTheDocument()
  })

  it("shows a client-side error when passwords do not match", async () => {
    renderRegister()
    await userEvent.type(screen.getByPlaceholderText("you@example.com"), "new@example.com")
    const [pass1, pass2] = screen.getAllByPlaceholderText("••••••••")
    await userEvent.type(pass1, "StrongPass1!")
    await userEvent.type(pass2, "DifferentPass!")
    await userEvent.click(screen.getByRole("button", { name: /Create Account/i }))
    await waitFor(() =>
      expect(screen.getByText("Passwords do not match.")).toBeInTheDocument()
    )
  })

  it("shows API validation errors under the form", async () => {
    server.use(
      http.post("http://localhost/api/auth/registration/", () =>
        HttpResponse.json(
          { password1: ["This password is too common."] },
          { status: 400 }
        )
      )
    )
    renderRegister()
    await userEvent.type(screen.getByPlaceholderText("you@example.com"), "new@example.com")
    const [pass1, pass2] = screen.getAllByPlaceholderText("••••••••")
    await userEvent.type(pass1, "password")
    await userEvent.type(pass2, "password")
    await userEvent.click(screen.getByRole("button", { name: /Create Account/i }))
    await waitFor(() =>
      expect(screen.getByText("This password is too common.")).toBeInTheDocument()
    )
  })
})
