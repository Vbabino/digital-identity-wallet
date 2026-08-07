import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { http, HttpResponse } from "msw"
import { NameHistoryTab } from "~/routes/dashboard/tabs/NameHistoryTab"
import { useDashboard } from "~/routes/dashboard/hooks/useDashboard"
import type { DashboardLoaderData, NameHistory } from "~/routes/dashboard/types"
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

function NameHistoryTabHarness({ initialData }: { initialData: DashboardLoaderData }) {
  const dashboard = useDashboard(initialData)
  return (
    <>
      <NameHistoryTab dashboard={dashboard} />
      <div data-testid="modal-type">{dashboard.modalType ?? "none"}</div>
      <div data-testid="modal-action">{dashboard.modalAction}</div>
      <div data-testid="delete-confirm">{dashboard.deleteConfirm ? "pending" : "none"}</div>
    </>
  )
}

function renderNameHistoryTab(initialData: DashboardLoaderData = emptyData) {
  return render(
    <MemoryRouter>
      <NameHistoryTabHarness initialData={initialData} />
    </MemoryRouter>
  )
}

const makeEntry = (id: string, givenName: string): NameHistory => ({
  id,
  family_name: "Smith",
  middle_name: "",
  given_name: givenName,
  valid_from: "2020-01-01T00:00:00Z",
  valid_until: "2024-01-01T00:00:00Z",
  visibility: "private",
})

describe("NameHistoryTab", () => {
  it("shows the empty state when there are no entries", () => {
    renderNameHistoryTab()
    expect(screen.getByText("No name history entries recorded.")).toBeInTheDocument()
  })

  it("renders entries without pagination controls when there is only one page", () => {
    renderNameHistoryTab({
      ...emptyData,
      nameHistories: [makeEntry("nh-1", "Alice")],
      nameHistoriesCount: 1,
    })
    expect(screen.getByText(/Alice/)).toBeInTheDocument()
    expect(screen.queryByText(/Page \d+ of \d+/)).not.toBeInTheDocument()
  })

  it("shows pagination controls when there are more than 10 entries, with Prev disabled on page 1", () => {
    renderNameHistoryTab({
      ...emptyData,
      nameHistories: [makeEntry("nh-1", "Alice")],
      nameHistoriesCount: 15,
      nameHistoriesHasNext: true,
      nameHistoriesHasPrevious: false,
    })
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Prev/ })).toBeDisabled()
    expect(screen.getByRole("button", { name: /Next/ })).not.toBeDisabled()
  })

  it("fetches the next page when Next is clicked", async () => {
    server.use(
      http.get("http://localhost/api/wallet/name-histories/", ({ request }) => {
        const page = new URL(request.url).searchParams.get("page")
        expect(page).toBe("2")
        return HttpResponse.json({
          count: 15,
          next: null,
          previous: "http://localhost/api/wallet/name-histories/?page=1",
          results: [makeEntry("nh-2", "Bob")],
        })
      })
    )
    renderNameHistoryTab({
      ...emptyData,
      nameHistories: [makeEntry("nh-1", "Alice")],
      nameHistoriesCount: 15,
      nameHistoriesHasNext: true,
      nameHistoriesHasPrevious: false,
    })
    await userEvent.click(screen.getByRole("button", { name: /Next/ }))
    await waitFor(() => expect(screen.getByText(/Bob/)).toBeInTheDocument())
    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument()
  })

  it("opens the create modal when 'Add Entry' is clicked", async () => {
    renderNameHistoryTab()
    await userEvent.click(screen.getByRole("button", { name: /Add Entry/ }))
    expect(screen.getByTestId("modal-type")).toHaveTextContent("nameHistory")
    expect(screen.getByTestId("modal-action")).toHaveTextContent("create")
  })

  it("opens the edit modal with the entry when 'Edit' is clicked", async () => {
    renderNameHistoryTab({
      ...emptyData,
      nameHistories: [makeEntry("nh-1", "Alice")],
      nameHistoriesCount: 1,
    })
    await userEvent.click(screen.getByRole("button", { name: /Edit/ }))
    expect(screen.getByTestId("modal-type")).toHaveTextContent("nameHistory")
    expect(screen.getByTestId("modal-action")).toHaveTextContent("edit")
  })

  it("sets a pending delete confirmation when 'Delete' is clicked", async () => {
    renderNameHistoryTab({
      ...emptyData,
      nameHistories: [makeEntry("nh-1", "Alice")],
      nameHistoriesCount: 1,
    })
    await userEvent.click(screen.getByRole("button", { name: /Delete/ }))
    expect(screen.getByTestId("delete-confirm")).toHaveTextContent("pending")
  })
})
