import { cn } from "~/lib/utils"

describe("cn", () => {
  it("merges class strings", () => {
    expect(cn("foo", "bar")).toBe("foo bar")
  })

  it("resolves Tailwind conflicts — later class wins", () => {
    expect(cn("p-4", "p-8")).toBe("p-8")
  })

  it("handles undefined values", () => {
    expect(cn("foo", undefined)).toBe("foo")
  })

  it("handles false conditional values", () => {
    const active = false
    expect(cn("base", active && "active")).toBe("base")
  })

  it("handles null values", () => {
    expect(cn("foo", null)).toBe("foo")
  })

  it("deduplicates conflicting text-size classes", () => {
    expect(cn("text-sm", "text-lg")).toBe("text-lg")
  })
})
