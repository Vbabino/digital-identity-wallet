/** Generates a cryptographically random hex string used as the OAuth state token. */
export function generateOAuthState(): string {
  const arr = new Uint8Array(16)
  crypto.getRandomValues(arr)
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("")
}

/** Base64url encode (no padding) — required by RFC 7636 for PKCE. */
export function base64urlEncode(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
}

/**
 * Generates a PKCE code_verifier (32 random bytes, base64url) and its
 * corresponding code_challenge (SHA-256 of the verifier, base64url).
 */
export async function generatePKCE(): Promise<{ verifier: string; challenge: string }> {
  const verifierBytes = new Uint8Array(32)
  crypto.getRandomValues(verifierBytes)
  const verifier = base64urlEncode(verifierBytes.buffer)
  const challengeBytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier))
  const challenge = base64urlEncode(challengeBytes)
  return { verifier, challenge }
}

/**
 * Builds and stores the PKCE + state credentials in sessionStorage, then
 * returns the Google OAuth URL the browser should navigate to.
 *
 * @param clientId  VITE_GOOGLE_CLIENT_ID
 * @param redirectUri  VITE_GOOGLE_REDIRECT_URI
 * @param intent  "login" | "connect" — stored in sessionStorage so the
 *                callback handler knows which backend endpoint to call
 */
export async function buildGoogleOAuthUrl(
  clientId: string,
  redirectUri: string,
  intent: "login" | "connect" = "login"
): Promise<string> {
  const state = generateOAuthState()
  const { verifier, challenge } = await generatePKCE()

  sessionStorage.setItem("oauth_state", state)
  sessionStorage.setItem("pkce_verifier", verifier)
  sessionStorage.setItem("oauth_intent", intent)

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth")
  url.searchParams.set("client_id", clientId)
  url.searchParams.set("redirect_uri", redirectUri)
  url.searchParams.set("response_type", "code")
  url.searchParams.set("scope", "email")
  url.searchParams.set("access_type", "online")
  url.searchParams.set("prompt", "consent")
  url.searchParams.set("state", state)
  url.searchParams.set("code_challenge", challenge)
  url.searchParams.set("code_challenge_method", "S256")

  return url.toString()
}
