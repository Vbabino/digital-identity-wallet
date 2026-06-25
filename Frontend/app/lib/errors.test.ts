import { extractApiError } from "~/lib/errors"

describe("extractApiError", () => {
  it("returns the default fallback when err is null", () => {
    expect(extractApiError(null)).toBe("An error occurred.")
  })

  it("returns the default fallback when err is a plain string", () => {
    expect(extractApiError("oops")).toBe("An error occurred.")
  })

  it("returns the default fallback when err has no response property", () => {
    expect(extractApiError({})).toBe("An error occurred.")
  })

  it("returns a custom fallback string when provided", () => {
    expect(extractApiError({}, "Custom fallback")).toBe("Custom fallback")
  })

  it("extracts a top-level string value from response data", () => {
    const err = { response: { data: { detail: "Not found." } } }
    expect(extractApiError(err)).toBe("Not found.")
  })

  it("flattens an object of string arrays", () => {
    const err = {
      response: {
        data: {
          email: ["Enter a valid email address."],
          password: ["This password is too short."],
        },
      },
    }
    const result = extractApiError(err)
    expect(result).toContain("Enter a valid email address.")
    expect(result).toContain("This password is too short.")
  })

  it("returns fallback when response data is an array (not an object)", () => {
    const err = { response: { data: ["something"] } }
    expect(extractApiError(err)).toBe("An error occurred.")
  })

  it("returns fallback when response data has no string values", () => {
    const err = { response: { data: { count: 42 } } }
    expect(extractApiError(err)).toBe("An error occurred.")
  })

  it("ignores non-string array elements", () => {
    const err = { response: { data: { items: [1, 2, 3] } } }
    expect(extractApiError(err)).toBe("An error occurred.")
  })
})
