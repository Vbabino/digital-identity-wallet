import { http, HttpResponse } from "msw"
import { clientLoader } from "~/routes/dashboard"
import { server } from "~/test/mocks/server"

// clientLoader takes no arguments — it reads from the API directly.

describe("dashboard clientLoader", () => {
  it("returns the user email and empty lists on a clean load", async () => {
    const result = await clientLoader()
    expect(result.userEmail).toBe("test@example.com")
    expect(result.addresses).toEqual([])
    expect(result.credentials).toEqual([])
    expect(result.accessLogs).toEqual([])
    expect(result.countries.length).toBeGreaterThan(0)
  })

  it("sets singleton fields to null when their endpoints return 404", async () => {
    // Default handlers return 404 for all three singleton endpoints
    const result = await clientLoader()
    expect(result.legalIdentity).toBeNull()
    expect(result.age).toBeNull()
    expect(result.placeOfBirth).toBeNull()
  })

  it("populates a singleton field when the endpoint returns data", async () => {
    server.use(
      http.get("http://localhost/api/wallet/legal-identities/", () =>
        HttpResponse.json({
          given_name: "Jane",
          middle_name: "",
          family_name: "Doe",
          given_name_birth: "",
          family_name_birth: "",
          visibility: "private",
        })
      )
    )
    const result = await clientLoader()
    expect(result.legalIdentity).toMatchObject({ given_name: "Jane" })
  })

  it("still returns null for a singleton when it returns 500 (allSettled absorbs it)", async () => {
    server.use(
      http.get("http://localhost/api/wallet/legal-identities/", () =>
        new HttpResponse(null, { status: 500 })
      )
    )
    const result = await clientLoader()
    // allSettled means any error on a singleton → null, not a redirect
    expect(result.legalIdentity).toBeNull()
  })

  it("populates list data from the API", async () => {
    server.use(
      http.get("http://localhost/api/wallet/addresses/", () =>
        HttpResponse.json([
          {
            id: "a1",
            address_type: "home",
            resident_street: "Loader St",
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
    const result = await clientLoader()
    expect(result.addresses[0]).toMatchObject({ resident_street: "Loader St" })
  })

  it("throws a redirect to /login when the user endpoint fails", async () => {
    server.use(
      http.get("http://localhost/api/auth/user/", () =>
        new HttpResponse(null, { status: 401 })
      )
    )
    const thrown = await clientLoader().catch((e: unknown) => e)
    expect(thrown).toBeInstanceOf(Response)
    expect((thrown as Response).headers.get("Location")).toBe("/login")
  })

  it("throws a redirect to /login when a list endpoint fails", async () => {
    server.use(
      http.get("http://localhost/api/wallet/addresses/", () =>
        new HttpResponse(null, { status: 500 })
      )
    )
    const thrown = await clientLoader().catch((e: unknown) => e)
    expect(thrown).toBeInstanceOf(Response)
    expect((thrown as Response).headers.get("Location")).toBe("/login")
  })
})
