import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse, delay } from "msw"
import { SettingsTab } from "./SettingsTab"
import { server } from "~/test/mocks/server"

describe("SettingsTab", () => {
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
})
