import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { http, HttpResponse } from "msw"
import { LogsTab } from "~/routes/dashboard/tabs/LogsTab"
import { useDashboard } from "~/routes/dashboard/hooks/useDashboard"
import type { DashboardLoaderData } from "~/routes/dashboard/types"
import { server } from "~/test/mocks/server"

const emptyData: DashboardLoaderData = {
  userEmail: "test@example.com",
  legalIdentity: null,
  age: null,
  placeOfBirth: null,
  addresses: [],
  nationalities: [],
  genders: [],
  professionals: [],
  onlineProfiles: [],
  dailyUses: [],
  pseudonyms: [],
  credentials: [],
  customObjects: [],
  accessLogs: [],
  accessLogsCount: 0,
  accessLogsHasNext: false,
  accessLogsHasPrevious: false,
  nameHistories: [],
  nameHistoriesCount: 0,
  nameHistoriesHasNext: false,
  nameHistoriesHasPrevious: false,
}

function LogsTabHarness({ initialData }: { initialData: DashboardLoaderData }) {
  const dashboard = useDashboard(initialData)
  return <LogsTab dashboard={dashboard} />
}

function renderLogsTab(initialData: DashboardLoaderData = emptyData) {
  return render(
    <MemoryRouter>
      <LogsTabHarness initialData={initialData} />
    </MemoryRouter>
  )
}

const makeLog = (id: string, relyingParty: string) => ({
  id,
  relying_party: relyingParty,
  scopes_accessed: ["openid"],
  claims_returned: ["sub"],
  access_time: "2026-01-01T00:00:00Z",
})

describe("LogsTab", () => {
  it("shows the empty state when there are no logs", () => {
    renderLogsTab()
    expect(screen.getByText("No authorization events logged in this session.")).toBeInTheDocument()
  })

  it("renders logs without pagination controls when there is only one page", () => {
    renderLogsTab({
      ...emptyData,
      accessLogs: [makeLog("log-1", "Acme")],
      accessLogsCount: 1,
    })
    expect(screen.getByText("Acme")).toBeInTheDocument()
    expect(screen.queryByText(/Page \d+ of \d+/)).not.toBeInTheDocument()
  })

  it("shows pagination controls when there are more than 10 logs, with Prev disabled on page 1", () => {
    renderLogsTab({
      ...emptyData,
      accessLogs: [makeLog("log-1", "Acme")],
      accessLogsCount: 15,
      accessLogsHasNext: true,
      accessLogsHasPrevious: false,
    })
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Prev/ })).toBeDisabled()
    expect(screen.getByRole("button", { name: /Next/ })).not.toBeDisabled()
  })

  it("fetches the next page when Next is clicked", async () => {
    server.use(
      http.get("http://localhost/api/wallet/access-logs/", ({ request }) => {
        const page = new URL(request.url).searchParams.get("page")
        expect(page).toBe("2")
        return HttpResponse.json({
          count: 15,
          next: null,
          previous: "http://localhost/api/wallet/access-logs/?page=1",
          results: [makeLog("log-2", "Second Page Client")],
        })
      })
    )
    renderLogsTab({
      ...emptyData,
      accessLogs: [makeLog("log-1", "Acme")],
      accessLogsCount: 15,
      accessLogsHasNext: true,
      accessLogsHasPrevious: false,
    })
    await userEvent.click(screen.getByRole("button", { name: /Next/ }))
    await waitFor(() => expect(screen.getByText("Second Page Client")).toBeInTheDocument())
    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument()
  })
})
