import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse, delay } from "msw"
import { vi } from "vitest"
import { SettingsTab } from "./SettingsTab"
import { server } from "~/test/mocks/server"

// Mock useNavigate so navigation calls can be asserted without needing a
// full router that tracks location state changes.
const mockNavigate = vi.fn()
vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router")
  return { ...actual, useNavigate: () => mockNavigate }
})

async function typeDeleteConfirmation() {
  await userEvent.type(screen.getByLabelText(/type/i), "DELETE")
}

describe("SettingsTab", () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it("renders the export section and download button", () => {
    render(<SettingsTab />)
    expect(screen.getByText("Export Wallet Data")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Download Export" })).toBeInTheDocument()
  })

  it("downloads the export file when clicked", async () => {
    const createObjectURLSpy = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:mock-url")
    const revokeObjectURLSpy = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {})
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {})

    render(<SettingsTab />)
    await userEvent.click(screen.getByRole("button", { name: "Download Export" }))

    await waitFor(() => expect(createObjectURLSpy).toHaveBeenCalled())
    expect(clickSpy).toHaveBeenCalled()
    expect(revokeObjectURLSpy).toHaveBeenCalledWith("blob:mock-url")

    createObjectURLSpy.mockRestore()
    revokeObjectURLSpy.mockRestore()
    clickSpy.mockRestore()
  })

  it("shows a loading state while the request is in flight", async () => {
    server.use(
      http.get("http://localhost/api/wallet/export/", async () => {
        await delay(50)
        return HttpResponse.json({})
      })
    )
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock-url")
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {})
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {})

    render(<SettingsTab />)
    await userEvent.click(screen.getByRole("button", { name: "Download Export" }))

    expect(screen.getByRole("button", { name: "Preparing…" })).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Download Export" })).toBeInTheDocument()
    )

    vi.restoreAllMocks()
  })

  it("shows the server-provided error message on a 500 response", async () => {
    server.use(
      http.get(
        "http://localhost/api/wallet/export/",
        () =>
          new HttpResponse(JSON.stringify({ detail: "Export failed." }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          })
      )
    )

    render(<SettingsTab />)
    await userEvent.click(screen.getByRole("button", { name: "Download Export" }))

    await waitFor(() => expect(screen.getByText("Export failed.")).toBeInTheDocument())
  })

  it("shows a generic fallback error message when the error body isn't parseable JSON", async () => {
    server.use(
      http.get(
        "http://localhost/api/wallet/export/",
        () =>
          new HttpResponse("not json", {
            status: 500,
            headers: { "Content-Type": "text/plain" },
          })
      )
    )

    render(<SettingsTab />)
    await userEvent.click(screen.getByRole("button", { name: "Download Export" }))

    await waitFor(() =>
      expect(
        screen.getByText("Failed to export wallet data. Please try again.")
      ).toBeInTheDocument()
    )
  })

  it("renders the delete-account section with the delete button disabled", () => {
    render(<SettingsTab />)
    expect(screen.getByText("Delete Account")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Delete My Account" })).toBeDisabled()
  })

  it("keeps the delete button disabled until the confirmation text matches exactly", async () => {
    render(<SettingsTab />)
    await userEvent.type(screen.getByLabelText(/type/i), "delete")
    expect(screen.getByRole("button", { name: "Delete My Account" })).toBeDisabled()

    await userEvent.clear(screen.getByLabelText(/type/i))
    await typeDeleteConfirmation()
    expect(screen.getByRole("button", { name: "Delete My Account" })).toBeEnabled()
  })

  it("opens a final confirmation dialog and does nothing on cancel", async () => {
    render(<SettingsTab />)
    await typeDeleteConfirmation()
    await userEvent.click(screen.getByRole("button", { name: "Delete My Account" }))

    expect(screen.getByText("Permanently delete your account?")).toBeInTheDocument()

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }))
    expect(
      screen.queryByText("Permanently delete your account?")
    ).not.toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it("deletes the account and navigates to /login with a notice on confirm", async () => {
    render(<SettingsTab />)
    await typeDeleteConfirmation()
    await userEvent.click(screen.getByRole("button", { name: "Delete My Account" }))
    await userEvent.click(screen.getByRole("button", { name: "Delete Account" }))

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("/login", {
        state: { notice: "Your account has been permanently deleted." },
      })
    )
  })

  it("shows the server-provided error message on a failed deletion", async () => {
    server.use(
      http.delete(
        "http://localhost/api/wallet/delete-account/",
        () =>
          new HttpResponse(JSON.stringify({ detail: "Deletion failed." }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          })
      )
    )

    render(<SettingsTab />)
    await typeDeleteConfirmation()
    await userEvent.click(screen.getByRole("button", { name: "Delete My Account" }))
    await userEvent.click(screen.getByRole("button", { name: "Delete Account" }))

    await waitFor(() => expect(screen.getByText("Deletion failed.")).toBeInTheDocument())
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
