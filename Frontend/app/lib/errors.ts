export function extractApiError(err: unknown, fallback = "An error occurred."): string {
  if (err == null || typeof err !== "object" || !("response" in err)) return fallback
  const data = (err as { response?: { data?: unknown } }).response?.data
  if (!data || typeof data !== "object" || Array.isArray(data)) return fallback
  const messages = Object.values(data as Record<string, unknown>)
    .flatMap((v) => (Array.isArray(v) ? v : [v]))
    .filter((v): v is string => typeof v === "string")
  return messages.join(" ") || fallback
}
