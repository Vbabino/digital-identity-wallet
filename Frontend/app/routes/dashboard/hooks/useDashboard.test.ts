import { renderHook, act } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { createElement } from "react"
import { http, HttpResponse } from "msw"
import { vi } from "vitest"
import { useDashboard } from "~/routes/dashboard/hooks/useDashboard"
import type { DashboardLoaderData } from "~/routes/dashboard/types"
import { server } from "~/test/mocks/server"

// Mock useNavigate so navigation calls can be asserted without needing a
// full router that tracks location state changes.
const mockNavigate = vi.fn()
vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router")
  return { ...actual, useNavigate: () => mockNavigate }
})

// useDashboard uses useNavigate, so it must run inside a router context.
const wrapper = ({ children }: { children: React.ReactNode }) =>
  createElement(MemoryRouter, null, children)

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
}

const mockEvent = () => ({ preventDefault: vi.fn() }) as unknown as React.FormEvent

describe("useDashboard — initial state", () => {
  it("exposes the email from initialData", () => {
    const { result } = renderHook(() => useDashboard(emptyData), { wrapper })
    expect(result.current.userEmail).toBe("test@example.com")
  })

  it("starts with null singleton values when initialData has nulls", () => {
    const { result } = renderHook(() => useDashboard(emptyData), { wrapper })
    expect(result.current.legalIdentity).toBeNull()
    expect(result.current.age).toBeNull()
    expect(result.current.placeOfBirth).toBeNull()
  })

  it("starts with empty lists for multi-record data", () => {
    const { result } = renderHook(() => useDashboard(emptyData), { wrapper })
    expect(result.current.addresses).toEqual([])
    expect(result.current.credentials).toEqual([])
  })

  it("has no open modal by default", () => {
    const { result } = renderHook(() => useDashboard(emptyData), { wrapper })
    expect(result.current.modalType).toBeNull()
  })
})

describe("useDashboard — toast", () => {
  it("shows a toast message", () => {
    const { result } = renderHook(() => useDashboard(emptyData), { wrapper })
    act(() => result.current.showToast("Hello!"))
    expect(result.current.toast).toMatchObject({ message: "Hello!", type: "success" })
  })

  it("auto-dismisses the toast after 3 seconds", async () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useDashboard(emptyData), { wrapper })
    act(() => result.current.showToast("Temporary!"))
    expect(result.current.toast).not.toBeNull()
    act(() => vi.advanceTimersByTime(3001))
    expect(result.current.toast).toBeNull()
    vi.useRealTimers()
  })

  it("supports error type toast", () => {
    const { result } = renderHook(() => useDashboard(emptyData), { wrapper })
    act(() => result.current.showToast("Something broke.", "error"))
    expect(result.current.toast).toMatchObject({ type: "error" })
  })
})

describe("useDashboard — singleton CRUD (saveLegalIdentity)", () => {
  it("POSTs when legalIdentity is null and updates state", async () => {
    const { result } = renderHook(() => useDashboard(emptyData), { wrapper })
    act(() =>
      result.current.setEditLegalForm({
        given_name: "John",
        middle_name: "",
        family_name: "Doe",
        given_name_birth: "",
        family_name_birth: "",
        visibility: "private",
      })
    )
    await act(async () => {
      await result.current.saveLegalIdentity(mockEvent())
    })
    expect(result.current.legalIdentity).toMatchObject({ given_name: "John" })
  })

  it("PATCHes when legalIdentity already exists", async () => {
    const existing: DashboardLoaderData = {
      ...emptyData,
      legalIdentity: {
        given_name: "Jane",
        middle_name: "",
        family_name: "Smith",
        given_name_birth: "",
        family_name_birth: "",
        visibility: "private",
      },
    }
    let method = ""
    server.use(
      http.patch("http://localhost/api/wallet/legal-identities/", ({ request }) => {
        method = request.method
        return HttpResponse.json({
          given_name: "John",
          middle_name: "",
          family_name: "Doe",
          given_name_birth: "",
          family_name_birth: "",
          visibility: "public",
        })
      })
    )
    const { result } = renderHook(() => useDashboard(existing), { wrapper })
    act(() =>
      result.current.setEditLegalForm({
        given_name: "John",
        middle_name: "",
        family_name: "Doe",
        given_name_birth: "",
        family_name_birth: "",
        visibility: "private",
      })
    )
    await act(async () => {
      await result.current.saveLegalIdentity(mockEvent())
    })
    expect(method).toBe("PATCH")
  })

  it("shows an error toast when the save fails", async () => {
    server.use(
      http.post("http://localhost/api/wallet/legal-identities/", () =>
        new HttpResponse(null, { status: 500 })
      )
    )
    const { result } = renderHook(() => useDashboard(emptyData), { wrapper })
    await act(async () => {
      await result.current.saveLegalIdentity(mockEvent())
    })
    expect(result.current.toast).toMatchObject({ type: "error" })
  })
})

describe("useDashboard — multi-record CRUD", () => {
  it("POSTs and prepends the new record when modalAction is 'create'", async () => {
    const { result } = renderHook(() => useDashboard(emptyData), { wrapper })
    act(() => result.current.openModal("address", "create"))
    await act(async () => {
      await result.current.handleMultiRecordSubmit(mockEvent())
    })
    expect(result.current.addresses[0]).toMatchObject({ resident_street: "Main St" })
    expect(result.current.modalType).toBeNull()
  })

  it("PATCHes and replaces the record in the list when modalAction is 'edit'", async () => {
    const dataWithAddress: DashboardLoaderData = {
      ...emptyData,
      addresses: [
        {
          id: "addr-1",
          address_type: "home",
          resident_street: "Old St",
          resident_house_number: "1",
          resident_city: "Old City",
          resident_state: "OC",
          resident_postal_code: "00001",
          resident_country: "US",
          visibility: "private",
        },
      ],
    }
    const { result } = renderHook(() => useDashboard(dataWithAddress), { wrapper })
    act(() =>
      result.current.openModal("address", "edit", dataWithAddress.addresses[0])
    )
    await act(async () => {
      await result.current.handleMultiRecordSubmit(mockEvent())
    })
    expect(result.current.addresses[0]).toMatchObject({ resident_street: "Updated St" })
  })

  it("sets deleteConfirm state (does not delete immediately)", () => {
    const { result } = renderHook(() => useDashboard(emptyData), { wrapper })
    const onSuccess = vi.fn()
    act(() => result.current.handleDeleteRecord("addresses", "addr-1", onSuccess))
    expect(result.current.deleteConfirm).toMatchObject({
      endpoint: "addresses",
      id: "addr-1",
    })
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it("executes DELETE and calls onSuccess when confirmDelete is called", async () => {
    const onSuccess = vi.fn()
    const { result } = renderHook(() => useDashboard(emptyData), { wrapper })
    act(() => result.current.handleDeleteRecord("addresses", "addr-1", onSuccess))
    await act(async () => {
      await result.current.confirmDelete()
    })
    expect(onSuccess).toHaveBeenCalledOnce()
    expect(result.current.deleteConfirm).toBeNull()
  })
})

describe("useDashboard — visibility toggle", () => {
  it("PATCHes with the toggled visibility value", async () => {
    let requestBody: unknown = null
    server.use(
      http.patch("http://localhost/api/wallet/legal-identities/", async ({ request }) => {
        requestBody = await request.json()
        return HttpResponse.json({
          given_name: "John",
          middle_name: "",
          family_name: "Doe",
          given_name_birth: "",
          family_name_birth: "",
          visibility: "public",
        })
      })
    )
    const { result } = renderHook(() => useDashboard(emptyData), { wrapper })
    const setter = vi.fn()
    await act(async () => {
      await result.current.toggleVisibility(
        "legal-identities",
        undefined,
        "private",
        setter,
        true
      )
    })
    expect(requestBody).toMatchObject({ visibility: "public" })
    expect(setter).toHaveBeenCalledWith(expect.objectContaining({ visibility: "public" }))
  })

  it("uses URL with :id for multi-record resources", async () => {
    let capturedUrl = ""
    server.use(
      http.patch("http://localhost/api/wallet/addresses/:id/", ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({
          id: "addr-1",
          address_type: "home",
          resident_street: "Main St",
          resident_house_number: "1",
          resident_city: "NYC",
          resident_state: "NY",
          resident_postal_code: "10001",
          resident_country: "US",
          visibility: "public",
        })
      })
    )
    const { result } = renderHook(() => useDashboard(emptyData), { wrapper })
    await act(async () => {
      await result.current.toggleVisibility(
        "addresses",
        "addr-1",
        "private",
        vi.fn(),
        false
      )
    })
    expect(capturedUrl).toContain("/addr-1/")
  })
})

describe("useDashboard — modal handlers", () => {
  it("openModal sets the modal type and action", () => {
    const { result } = renderHook(() => useDashboard(emptyData), { wrapper })
    act(() => result.current.openModal("nationality", "create"))
    expect(result.current.modalType).toBe("nationality")
    expect(result.current.modalAction).toBe("create")
  })

  it("closeModal clears the modal type", () => {
    const { result } = renderHook(() => useDashboard(emptyData), { wrapper })
    act(() => result.current.openModal("gender", "create"))
    act(() => result.current.closeModal())
    expect(result.current.modalType).toBeNull()
  })

  it("openModal with 'edit' populates the form from the item", () => {
    const { result } = renderHook(() => useDashboard(emptyData), { wrapper })
    act(() =>
      result.current.openModal("nationality", "edit", {
        id: "nat-1",
        nationality: "PT",
        visibility: "public",
      })
    )
    expect(result.current.nationalityForm.nationality).toBe("PT")
  })
})

describe("useDashboard — fetchAllData", () => {
  beforeEach(() => mockNavigate.mockClear())

  it("fetches multi-record data and updates state", async () => {
    server.use(
      http.get("http://localhost/api/wallet/addresses/", () =>
        HttpResponse.json([
          {
            id: "a1",
            address_type: "home",
            resident_street: "Fetched St",
            resident_house_number: "1",
            resident_city: "NYC",
            resident_state: "NY",
            resident_postal_code: "10001",
            resident_country: "US",
            visibility: "private",
          },
        ])
      )
    )
    const { result } = renderHook(() => useDashboard(emptyData), { wrapper })
    await act(async () => {
      await result.current.fetchAllData()
    })
    expect(result.current.addresses[0]).toMatchObject({ resident_street: "Fetched St" })
  })

  it("sets loading to false after fetchAllData completes", async () => {
    const { result } = renderHook(() => useDashboard(emptyData), { wrapper })
    expect(result.current.loading).toBe(false)
    await act(async () => {
      await result.current.fetchAllData()
    })
    expect(result.current.loading).toBe(false)
  })

  it("navigates to /login when a list endpoint returns 401", async () => {
    server.use(
      http.get("http://localhost/api/wallet/addresses/", () =>
        new HttpResponse(null, { status: 401 })
      )
    )
    const { result } = renderHook(() => useDashboard(emptyData), { wrapper })
    await act(async () => {
      await result.current.fetchAllData()
    })
    expect(mockNavigate).toHaveBeenCalledWith("/login")
  })
})

describe("useDashboard — fetchLogsPage", () => {
  beforeEach(() => mockNavigate.mockClear())

  it("fetches a page of access logs and updates pagination state", async () => {
    server.use(
      http.get("http://localhost/api/wallet/access-logs/", ({ request }) => {
        const page = new URL(request.url).searchParams.get("page")
        expect(page).toBe("2")
        return HttpResponse.json({
          count: 15,
          next: null,
          previous: "http://localhost/api/wallet/access-logs/?page=1",
          results: [
            {
              id: "log-1",
              relying_party: "Acme",
              scopes_accessed: ["openid"],
              claims_returned: ["sub"],
              access_time: "2026-01-01T00:00:00Z",
            },
          ],
        })
      })
    )
    const { result } = renderHook(() => useDashboard(emptyData), { wrapper })
    await act(async () => {
      await result.current.fetchLogsPage(2)
    })
    expect(result.current.accessLogs).toHaveLength(1)
    expect(result.current.logsPage).toBe(2)
    expect(result.current.logsCount).toBe(15)
    expect(result.current.logsHasNext).toBe(false)
    expect(result.current.logsHasPrevious).toBe(true)
  })

  it("navigates to /login when the access-logs endpoint returns 401", async () => {
    server.use(
      http.get("http://localhost/api/wallet/access-logs/", () =>
        new HttpResponse(null, { status: 401 })
      )
    )
    const { result } = renderHook(() => useDashboard(emptyData), { wrapper })
    await act(async () => {
      await result.current.fetchLogsPage(2)
    })
    expect(mockNavigate).toHaveBeenCalledWith("/login")
  })
})

describe("useDashboard — logout", () => {
  beforeEach(() => mockNavigate.mockClear())

  it("calls the logout API and navigates to /login on success", async () => {
    const { result } = renderHook(() => useDashboard(emptyData), { wrapper })
    await act(async () => {
      await result.current.handleLogout()
    })
    expect(mockNavigate).toHaveBeenCalledWith("/login")
    expect(result.current.toast).toMatchObject({ type: "success" })
  })

  it("navigates to /login even when the logout API fails", async () => {
    server.use(
      http.post("http://localhost/api/auth/logout/", () =>
        new HttpResponse(null, { status: 500 })
      )
    )
    const { result } = renderHook(() => useDashboard(emptyData), { wrapper })
    await act(async () => {
      await result.current.handleLogout()
    })
    expect(mockNavigate).toHaveBeenCalledWith("/login")
  })
})

describe("useDashboard — singleton CRUD (saveAge / saveBirthPlace)", () => {
  it("saveAge POSTs when age is null and updates state", async () => {
    const { result } = renderHook(() => useDashboard(emptyData), { wrapper })
    act(() => result.current.setEditAgeForm({ birth_date: "1990-05-15", visibility: "private" }))
    await act(async () => {
      await result.current.saveAge(mockEvent())
    })
    expect(result.current.age).toMatchObject({ birth_date: "1990-01-01" }) // response from handler
    expect(result.current.toast).toMatchObject({ type: "success" })
  })

  it("saveAge PATCHes when age already exists", async () => {
    let method = ""
    server.use(
      http.patch("http://localhost/api/wallet/date-of-birth/", ({ request }) => {
        method = request.method
        return HttpResponse.json({ birth_date: "1990-01-01", visibility: "private" })
      })
    )
    const dataWithAge: DashboardLoaderData = {
      ...emptyData,
      age: { birth_date: "1985-01-01", visibility: "private" },
    }
    const { result } = renderHook(() => useDashboard(dataWithAge), { wrapper })
    await act(async () => {
      await result.current.saveAge(mockEvent())
    })
    expect(method).toBe("PATCH")
  })

  it("saveBirthPlace POSTs when placeOfBirth is null and updates state", async () => {
    const { result } = renderHook(() => useDashboard(emptyData), { wrapper })
    act(() =>
      result.current.setEditBirthPlaceForm({
        birth_city: "London",
        birth_state: "",
        birth_country: "GB",
        visibility: "private",
      })
    )
    await act(async () => {
      await result.current.saveBirthPlace(mockEvent())
    })
    expect(result.current.placeOfBirth).toMatchObject({ birth_city: "New York" }) // response from handler
    expect(result.current.toast).toMatchObject({ type: "success" })
  })

  it("saveBirthPlace PATCHes when placeOfBirth already exists", async () => {
    let method = ""
    server.use(
      http.patch("http://localhost/api/wallet/place-of-birth/", ({ request }) => {
        method = request.method
        return HttpResponse.json({
          birth_city: "New York",
          birth_state: "NY",
          birth_country: "US",
          visibility: "private",
        })
      })
    )
    const dataWithBirth: DashboardLoaderData = {
      ...emptyData,
      placeOfBirth: { birth_city: "London", birth_state: "", birth_country: "GB", visibility: "private" },
    }
    const { result } = renderHook(() => useDashboard(dataWithBirth), { wrapper })
    await act(async () => {
      await result.current.saveBirthPlace(mockEvent())
    })
    expect(method).toBe("PATCH")
  })
})
