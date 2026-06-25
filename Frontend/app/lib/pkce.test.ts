import { generateOAuthState, base64urlEncode, generatePKCE, buildGoogleOAuthUrl } from "~/lib/pkce"

describe("generateOAuthState", () => {
  it("returns a 32-character hex string", () => {
    expect(generateOAuthState()).toMatch(/^[0-9a-f]{32}$/)
  })

  it("returns a unique value on each call", () => {
    expect(generateOAuthState()).not.toBe(generateOAuthState())
  })
})

describe("base64urlEncode", () => {
  it("does not contain +, / or = characters", () => {
    // Use bytes that would normally produce + / = in standard base64
    const buf = new Uint8Array([0xff, 0xfe, 0xfd, 0xfc, 0xfb]).buffer
    const encoded = base64urlEncode(buf)
    expect(encoded).not.toMatch(/[+/=]/)
  })

  it("uses - and _ as replacements", () => {
    // 0b11111011_11111110 = 0xFB 0xFE, encodes to +/... in standard base64
    const buf = new Uint8Array([0xfb, 0xff]).buffer
    const encoded = base64urlEncode(buf)
    // Should only contain base64url-safe characters
    expect(encoded).toMatch(/^[A-Za-z0-9\-_]+$/)
  })
})

describe("generatePKCE", () => {
  it("returns a verifier and a challenge", async () => {
    const { verifier, challenge } = await generatePKCE()
    expect(verifier.length).toBeGreaterThan(0)
    expect(challenge.length).toBeGreaterThan(0)
  })

  it("verifier contains only base64url-safe characters", async () => {
    const { verifier } = await generatePKCE()
    expect(verifier).toMatch(/^[A-Za-z0-9\-_]+$/)
  })

  it("challenge contains only base64url-safe characters", async () => {
    const { challenge } = await generatePKCE()
    expect(challenge).toMatch(/^[A-Za-z0-9\-_]+$/)
  })

  it("produces different values on each call", async () => {
    const a = await generatePKCE()
    const b = await generatePKCE()
    expect(a.verifier).not.toBe(b.verifier)
    expect(a.challenge).not.toBe(b.challenge)
  })
})

describe("buildGoogleOAuthUrl", () => {
  beforeEach(() => sessionStorage.clear())

  it("stores oauth_state in sessionStorage", async () => {
    await buildGoogleOAuthUrl("client-id", "http://localhost/callback", "login")
    expect(sessionStorage.getItem("oauth_state")).toBeTruthy()
  })

  it("stores pkce_verifier in sessionStorage", async () => {
    await buildGoogleOAuthUrl("client-id", "http://localhost/callback", "login")
    expect(sessionStorage.getItem("pkce_verifier")).toBeTruthy()
  })

  it("stores the intent in sessionStorage", async () => {
    await buildGoogleOAuthUrl("client-id", "http://localhost/callback", "connect")
    expect(sessionStorage.getItem("oauth_intent")).toBe("connect")
  })

  it("returns a URL with response_type=code", async () => {
    const url = await buildGoogleOAuthUrl("client-id", "http://localhost/callback", "login")
    expect(new URL(url).searchParams.get("response_type")).toBe("code")
  })

  it("returns a URL with code_challenge_method=S256", async () => {
    const url = await buildGoogleOAuthUrl("client-id", "http://localhost/callback", "login")
    expect(new URL(url).searchParams.get("code_challenge_method")).toBe("S256")
  })

  it("includes the client_id in the URL", async () => {
    const url = await buildGoogleOAuthUrl("my-client-id", "http://localhost/callback")
    expect(new URL(url).searchParams.get("client_id")).toBe("my-client-id")
  })

  it("includes the redirect_uri in the URL", async () => {
    const url = await buildGoogleOAuthUrl("client-id", "http://localhost/my-redirect")
    expect(new URL(url).searchParams.get("redirect_uri")).toBe("http://localhost/my-redirect")
  })

  it("defaults intent to 'login'", async () => {
    await buildGoogleOAuthUrl("client-id", "http://localhost/callback")
    expect(sessionStorage.getItem("oauth_intent")).toBe("login")
  })
})
