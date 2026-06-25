import { renderHook, act, waitFor } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { vi } from "vitest"
import { useMfa } from "~/routes/dashboard/hooks/useMfa"
import { server } from "~/test/mocks/server"

describe("useMfa — initial load", () => {
  it("starts in list view", async () => {
    const { result } = renderHook(() => useMfa())
    await waitFor(() => expect(result.current.listLoading).toBe(false))
    expect(result.current.view).toBe("list")
  })

  it("populates methods from the API", async () => {
    server.use(
      http.get("http://localhost/api/auth/mfa/", () =>
        HttpResponse.json([
          { name: "app", is_active: true, is_primary: true, is_setup: true },
        ])
      )
    )
    const { result } = renderHook(() => useMfa())
    await waitFor(() => expect(result.current.listLoading).toBe(false))
    expect(result.current.methods).toHaveLength(1)
    expect(result.current.methods[0].name).toBe("app")
  })

  it("sets listError when the API fails", async () => {
    server.use(
      http.get("http://localhost/api/auth/mfa/", () =>
        new HttpResponse(null, { status: 500 })
      )
    )
    const { result } = renderHook(() => useMfa())
    await waitFor(() => expect(result.current.listLoading).toBe(false))
    expect(result.current.listError).toBeTruthy()
  })
})

describe("useMfa — setup flow", () => {
  it("transitions to setup-confirm and stores setup data after startSetup", async () => {
    const { result } = renderHook(() => useMfa())
    await waitFor(() => expect(result.current.listLoading).toBe(false))
    await act(async () => {
      await result.current.handleStartSetup("app")
    })
    expect(result.current.view).toBe("setup-confirm")
    expect(result.current.setupData).toMatchObject({ qr_code: expect.any(String) })
    expect(result.current.backupCodes).toHaveLength(3)
  })

  it("transitions to setup-confirm for email method (no qr_code required)", async () => {
    const { result } = renderHook(() => useMfa())
    await waitFor(() => expect(result.current.listLoading).toBe(false))
    await act(async () => {
      await result.current.handleStartSetup("email")
    })
    expect(result.current.view).toBe("setup-confirm")
    expect(result.current.setupMethod).toBe("email")
  })

  it("transitions to backup-codes after confirmSetup with a valid code", async () => {
    const { result } = renderHook(() => useMfa())
    await waitFor(() => expect(result.current.listLoading).toBe(false))
    await act(async () => {
      await result.current.handleStartSetup("app")
    })
    act(() => result.current.setSetupCode("123456"))
    await act(async () => {
      await result.current.handleConfirmSetup({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent)
    })
    expect(result.current.view).toBe("backup-codes")
  })

  it("sets setupError when confirmSetup API call fails", async () => {
    server.use(
      http.post("http://localhost/api/auth/mfa/confirm/", () =>
        HttpResponse.json({ detail: "Invalid code." }, { status: 400 })
      )
    )
    const { result } = renderHook(() => useMfa())
    await waitFor(() => expect(result.current.listLoading).toBe(false))
    await act(async () => {
      await result.current.handleStartSetup("app")
    })
    act(() => result.current.setSetupCode("000000"))
    await act(async () => {
      await result.current.handleConfirmSetup({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent)
    })
    expect(result.current.setupError).toBeTruthy()
    expect(result.current.view).toBe("setup-confirm")
  })

  it("sets setupError when confirmSetup is called with an empty code", async () => {
    const { result } = renderHook(() => useMfa())
    await waitFor(() => expect(result.current.listLoading).toBe(false))
    await act(async () => {
      await result.current.handleStartSetup("app")
    })
    // Do NOT set setupCode — it stays empty
    await act(async () => {
      await result.current.handleConfirmSetup({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent)
    })
    expect(result.current.setupError).toBe("Please enter the verification code.")
  })

  it("goToList resets setup state and returns to list view", async () => {
    const { result } = renderHook(() => useMfa())
    await waitFor(() => expect(result.current.listLoading).toBe(false))
    await act(async () => {
      await result.current.handleStartSetup("app")
    })
    expect(result.current.view).toBe("setup-confirm")
    act(() => result.current.goToList())
    expect(result.current.view).toBe("list")
    expect(result.current.setupMethod).toBe("")
    expect(result.current.setupData).toBeNull()
  })
})

describe("useMfa — method actions", () => {
  const appMethod = { name: "app", is_active: true, is_primary: false, is_setup: true }

  it("calls /api/auth/mfa/primary/ for 'primary' action", async () => {
    let calledUrl = ""
    server.use(
      http.post("http://localhost/api/auth/mfa/primary/", ({ request }) => {
        calledUrl = request.url
        return HttpResponse.json({})
      })
    )
    const { result } = renderHook(() => useMfa())
    await waitFor(() => expect(result.current.listLoading).toBe(false))
    await act(async () => {
      await result.current.handleAction(appMethod, "primary")
    })
    expect(calledUrl).toContain("/api/auth/mfa/primary/")
    expect(result.current.actionStatus?.type).toBe("success")
  })

  it("calls /api/auth/mfa/deactivate/ for 'deactivate' action", async () => {
    let calledUrl = ""
    server.use(
      http.post("http://localhost/api/auth/mfa/deactivate/", ({ request }) => {
        calledUrl = request.url
        return HttpResponse.json({})
      })
    )
    const { result } = renderHook(() => useMfa())
    await waitFor(() => expect(result.current.listLoading).toBe(false))
    await act(async () => {
      await result.current.handleAction(appMethod, "deactivate", "123456")
    })
    expect(calledUrl).toContain("/api/auth/mfa/deactivate/")
  })

  it("calls /api/auth/mfa/delete/ for 'delete' action", async () => {
    let calledUrl = ""
    server.use(
      http.post("http://localhost/api/auth/mfa/delete/", ({ request }) => {
        calledUrl = request.url
        return HttpResponse.json({})
      })
    )
    const { result } = renderHook(() => useMfa())
    await waitFor(() => expect(result.current.listLoading).toBe(false))
    await act(async () => {
      await result.current.handleAction(appMethod, "delete", "123456")
    })
    expect(calledUrl).toContain("/api/auth/mfa/delete/")
  })

  it("sets actionStatus to error when the action API call fails", async () => {
    server.use(
      http.post("http://localhost/api/auth/mfa/primary/", () =>
        HttpResponse.json({ detail: "Cannot change primary method." }, { status: 400 })
      )
    )
    const { result } = renderHook(() => useMfa())
    await waitFor(() => expect(result.current.listLoading).toBe(false))
    await act(async () => {
      await result.current.handleAction(appMethod, "primary")
    })
    expect(result.current.actionStatus?.type).toBe("error")
  })

  it("sends the code in the request body when provided", async () => {
    let requestBody: unknown = null
    server.use(
      http.post("http://localhost/api/auth/mfa/deactivate/", async ({ request }) => {
        requestBody = await request.json()
        return HttpResponse.json({})
      })
    )
    const { result } = renderHook(() => useMfa())
    await waitFor(() => expect(result.current.listLoading).toBe(false))
    await act(async () => {
      await result.current.handleAction(appMethod, "deactivate", "654321")
    })
    expect(requestBody).toMatchObject({ method: "app", code: "654321" })
  })

  it("calls /api/auth/mfa/send/ for 'send' action and shows success status", async () => {
    const emailMethod = { name: "email", is_active: true, is_primary: true, is_setup: true }
    let calledUrl = ""
    server.use(
      http.post("http://localhost/api/auth/mfa/send/", ({ request }) => {
        calledUrl = request.url
        return HttpResponse.json({})
      })
    )
    const { result } = renderHook(() => useMfa())
    await waitFor(() => expect(result.current.listLoading).toBe(false))
    await act(async () => {
      await result.current.handleAction(emailMethod, "send")
    })
    expect(calledUrl).toContain("/api/auth/mfa/send/")
    expect(result.current.actionStatus?.type).toBe("success")
    expect(result.current.actionStatus?.msg).toBe("Verification code sent.")
  })
})

describe("useMfa — backup codes copy", () => {
  it("sets copied to true and calls clipboard.writeText after copying backup codes", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    })

    const { result } = renderHook(() => useMfa())
    await waitFor(() => expect(result.current.listLoading).toBe(false))

    // Start setup to populate backupCodes
    await act(async () => {
      await result.current.handleStartSetup("app")
    })
    expect(result.current.backupCodes).toHaveLength(3)

    await act(async () => {
      await result.current.handleCopyBackupCodes()
    })

    expect(writeText).toHaveBeenCalledWith("code-1\ncode-2\ncode-3")
    expect(result.current.copied).toBe(true)
  })

  it("does not throw when clipboard.writeText rejects", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
      writable: true,
      configurable: true,
    })

    const { result } = renderHook(() => useMfa())
    await waitFor(() => expect(result.current.listLoading).toBe(false))
    await act(async () => { await result.current.handleStartSetup("app") })

    // Should not throw
    await act(async () => {
      await result.current.handleCopyBackupCodes()
    })
    expect(result.current.copied).toBe(false)
  })
})
