import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { ProfessionalTab } from "~/routes/dashboard/tabs/ProfessionalTab"
import { useDashboard } from "~/routes/dashboard/hooks/useDashboard"
import type { DashboardLoaderData, Pseudonym } from "~/routes/dashboard/types"

// This file covers only the Pseudonyms section of ProfessionalTab — the tab's
// pre-existing Professional Identity / Online Profiles / Daily Aliases
// sections had no test coverage before this file was added and remain
// untested here, out of scope for wiring up the previously-unused
// pseudonyms endpoint.

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
  countries: [],
  accessLogs: [],
  accessLogsCount: 0,
  accessLogsHasNext: false,
  accessLogsHasPrevious: false,
  nameHistories: [],
  nameHistoriesCount: 0,
  nameHistoriesHasNext: false,
  nameHistoriesHasPrevious: false,
}

function ProfessionalTabHarness({ initialData }: { initialData: DashboardLoaderData }) {
  const dashboard = useDashboard(initialData)
  return (
    <>
      <ProfessionalTab dashboard={dashboard} />
      <div data-testid="modal-type">{dashboard.modalType ?? "none"}</div>
      <div data-testid="modal-action">{dashboard.modalAction}</div>
      <div data-testid="delete-confirm">{dashboard.deleteConfirm ? "pending" : "none"}</div>
    </>
  )
}

function renderProfessionalTab(initialData: DashboardLoaderData = emptyData) {
  return render(
    <MemoryRouter>
      <ProfessionalTabHarness initialData={initialData} />
    </MemoryRouter>
  )
}

const makePseudonym = (id: string, relyingParty: string): Pseudonym => ({
  id,
  relying_party: relyingParty,
  pseudonym_value: "shadow_99",
  is_active: true,
  visibility: "private",
})

describe("ProfessionalTab — Pseudonyms", () => {
  it("shows the empty state when there are no pseudonyms", () => {
    renderProfessionalTab()
    expect(screen.getByText("No pseudonyms registered.")).toBeInTheDocument()
  })

  it("renders a pseudonym record with its relying party, value, and active status", () => {
    renderProfessionalTab({
      ...emptyData,
      pseudonyms: [makePseudonym("pseudo-1", "Acme")],
    })
    expect(screen.getByText("Acme")).toBeInTheDocument()
    expect(screen.getByText("shadow_99")).toBeInTheDocument()
    expect(screen.getByText("Active")).toBeInTheDocument()
  })

  it("renders an inactive pseudonym as Inactive", () => {
    renderProfessionalTab({
      ...emptyData,
      pseudonyms: [{ ...makePseudonym("pseudo-1", "Acme"), is_active: false }],
    })
    expect(screen.getByText("Inactive")).toBeInTheDocument()
  })

  it("opens the create modal when 'Add Pseudonym' is clicked", async () => {
    renderProfessionalTab()
    await userEvent.click(screen.getByRole("button", { name: /Add Pseudonym/ }))
    expect(screen.getByTestId("modal-type")).toHaveTextContent("pseudonym")
    expect(screen.getByTestId("modal-action")).toHaveTextContent("create")
  })

  it("opens the edit modal with the pseudonym when 'Edit' is clicked", async () => {
    renderProfessionalTab({
      ...emptyData,
      pseudonyms: [makePseudonym("pseudo-1", "Acme")],
    })
    await userEvent.click(screen.getByRole("button", { name: /Edit/ }))
    expect(screen.getByTestId("modal-type")).toHaveTextContent("pseudonym")
    expect(screen.getByTestId("modal-action")).toHaveTextContent("edit")
  })

  it("sets a pending delete confirmation when 'Delete' is clicked", async () => {
    renderProfessionalTab({
      ...emptyData,
      pseudonyms: [makePseudonym("pseudo-1", "Acme")],
    })
    await userEvent.click(screen.getByRole("button", { name: /Delete/ }))
    expect(screen.getByTestId("delete-confirm")).toHaveTextContent("pending")
  })
})
