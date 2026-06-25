import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { http, HttpResponse } from "msw"
import { SocialAccountsManager } from "~/routes/dashboard/components/SocialAccountsManager"
import { server } from "~/test/mocks/server"

const googleAccount = {
  id: 1,
  provider: "google",
  uid: "uid-123",
  last_login: "2024-06-01T10:00:00Z",
  date_joined: "2024-01-01T00:00:00Z",
}

function renderManager(search = "") {
  return render(
    <MemoryRouter initialEntries={[`/dashboard${search}`]}>
      <SocialAccountsManager />
    </MemoryRouter>
  )
}

describe("SocialAccountsManager", () => {
  it("shows a loading indicator while fetching accounts", () => {
    renderManager()
    expect(screen.getByText("Loading…")).toBeInTheDocument()
  })

  it("shows 'No social accounts connected.' when the list is empty", async () => {
    renderManager()
    await waitFor(() =>
      expect(screen.getByText("No social accounts connected.")).toBeInTheDocument()
    )
  })

  it("renders an account card with the provider name", async () => {
    server.use(
      http.get("http://localhost/api/auth/social/accounts/", () =>
        HttpResponse.json([googleAccount])
      )
    )
    renderManager()
    await waitFor(() => expect(screen.getByText("Google")).toBeInTheDocument())
  })

  it("shows an inline confirmation panel when Disconnect is clicked", async () => {
    server.use(
      http.get("http://localhost/api/auth/social/accounts/", () =>
        HttpResponse.json([googleAccount])
      )
    )
    renderManager()
    await waitFor(() => expect(screen.getByText("Google")).toBeInTheDocument())
    await userEvent.click(screen.getByRole("button", { name: "Disconnect" }))
    // The Cancel button appears only inside the confirmation panel
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument()
  })

  it("calls DELETE and removes the card after confirming disconnect", async () => {
    let deleteCalled = false
    server.use(
      http.get("http://localhost/api/auth/social/accounts/", () =>
        HttpResponse.json([googleAccount])
      ),
      http.delete("http://localhost/api/auth/social/accounts/:id/", () => {
        deleteCalled = true
        return new HttpResponse(null, { status: 204 })
      })
    )
    renderManager()
    await waitFor(() => expect(screen.getByText("Google")).toBeInTheDocument())
    // First click opens the confirmation panel
    await userEvent.click(screen.getByRole("button", { name: "Disconnect" }))
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument()
    )
    // Now two "Disconnect" buttons exist; the second is inside the confirmation panel
    const allDisconnect = screen.getAllByRole("button", { name: "Disconnect" })
    await userEvent.click(allDisconnect[allDisconnect.length - 1])
    await waitFor(() => expect(deleteCalled).toBe(true))
    await waitFor(() =>
      expect(screen.getByText("Social account disconnected.")).toBeInTheDocument()
    )
  })

  it("shows a success banner when ?social_connected=google is in the URL", async () => {
    server.use(
      http.get("http://localhost/api/auth/social/accounts/", () =>
        HttpResponse.json([googleAccount])
      )
    )
    renderManager("?social_connected=google")
    await waitFor(() =>
      expect(
        screen.getByText("Google account connected successfully.")
      ).toBeInTheDocument()
    )
  })

  it("shows a disconnect error message when the DELETE fails", async () => {
    server.use(
      http.get("http://localhost/api/auth/social/accounts/", () =>
        HttpResponse.json([googleAccount])
      ),
      http.delete("http://localhost/api/auth/social/accounts/:id/", () =>
        new HttpResponse(null, { status: 400 })
      )
    )
    renderManager()
    await waitFor(() => expect(screen.getByText("Google")).toBeInTheDocument())
    await userEvent.click(screen.getByRole("button", { name: "Disconnect" }))
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument()
    )
    const allDisconnect = screen.getAllByRole("button", { name: "Disconnect" })
    await userEvent.click(allDisconnect[allDisconnect.length - 1])
    await waitFor(() =>
      expect(screen.getByText(/Failed to disconnect/i)).toBeInTheDocument()
    )
  })

  it("Cancel button in the confirmation panel dismisses it", async () => {
    server.use(
      http.get("http://localhost/api/auth/social/accounts/", () =>
        HttpResponse.json([googleAccount])
      )
    )
    renderManager()
    await waitFor(() => expect(screen.getByText("Google")).toBeInTheDocument())
    await userEvent.click(screen.getByRole("button", { name: "Disconnect" }))
    // Confirmation panel visible
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }))
    // Confirmation panel dismissed — Cancel button gone
    expect(screen.queryByRole("button", { name: "Cancel" })).not.toBeInTheDocument()
  })
})
