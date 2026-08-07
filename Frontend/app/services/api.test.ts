import { http, HttpResponse } from "msw"
import { api } from "~/services/api"
import { server } from "~/test/mocks/server"

describe("api — silent refresh interceptor", () => {
  it("refreshes and retries once on a 401, resolving transparently", async () => {
    let refreshCalls = 0
    let addressCalls = 0

    server.use(
      http.post("http://localhost/api/auth/token/refresh/", () => {
        refreshCalls += 1
        return HttpResponse.json({})
      }),
      http.get("http://localhost/api/wallet/addresses/", () => {
        addressCalls += 1
        if (addressCalls === 1) return new HttpResponse(null, { status: 401 })
        return HttpResponse.json([{ id: "a1" }])
      })
    )

    const res = await api.get("http://localhost/api/wallet/addresses/")

    expect(res.data).toEqual([{ id: "a1" }])
    expect(refreshCalls).toBe(1)
    expect(addressCalls).toBe(2)
  })

  it("propagates the original 401 when the refresh call itself fails", async () => {
    server.use(
      http.post("http://localhost/api/auth/token/refresh/", () =>
        new HttpResponse(null, { status: 401 })
      ),
      http.get("http://localhost/api/wallet/addresses/", () =>
        new HttpResponse(null, { status: 401 })
      )
    )

    const error = await api
      .get("http://localhost/api/wallet/addresses/")
      .catch((e: unknown) => e)

    expect((error as { response?: { status?: number } }).response?.status).toBe(401)
  })

  it("shares one in-flight refresh call across concurrent 401s", async () => {
    let refreshCalls = 0
    const callCounts = new Map<string, number>()

    server.use(
      http.post("http://localhost/api/auth/token/refresh/", () => {
        refreshCalls += 1
        return HttpResponse.json({})
      }),
      http.get("http://localhost/api/wallet/addresses/", ({ request }) => {
        const n = (callCounts.get(request.url) ?? 0) + 1
        callCounts.set(request.url, n)
        // First hit per distinct URL is a stale access token (401); the
        // retry after refresh (second hit on the same URL) succeeds.
        if (n === 1) return new HttpResponse(null, { status: 401 })
        return HttpResponse.json([])
      })
    )

    // Two independent requests (distinct query params so each has its own
    // fail-once-then-succeed counter) racing into 401 at the same time.
    const [a, b] = await Promise.all([
      api.get("http://localhost/api/wallet/addresses/?id=1"),
      api.get("http://localhost/api/wallet/addresses/?id=2"),
    ])

    expect(a.status).toBe(200)
    expect(b.status).toBe(200)
    expect(refreshCalls).toBe(1)
  })

  it("does not attempt a refresh for non-401 errors", async () => {
    let refreshCalls = 0
    server.use(
      http.post("http://localhost/api/auth/token/refresh/", () => {
        refreshCalls += 1
        return HttpResponse.json({})
      }),
      http.get("http://localhost/api/wallet/addresses/", () =>
        new HttpResponse(null, { status: 500 })
      )
    )

    const error = await api
      .get("http://localhost/api/wallet/addresses/")
      .catch((e: unknown) => e)

    expect((error as { response?: { status?: number } }).response?.status).toBe(500)
    expect(refreshCalls).toBe(0)
  })
})
