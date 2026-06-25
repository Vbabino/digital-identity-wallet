import { http, HttpResponse } from "msw"

// All handlers use absolute URLs with http://localhost because axios resolves
// relative baseURL ("") against window.location.origin (set to http://localhost
// in vitest.config.ts via environmentOptions.happyDOM.url).

export const handlers = [
  // ── Auth ─────────────────────────────────────────────────────────────────
  http.post("http://localhost/api/auth/login/", () =>
    HttpResponse.json({ mfa_enabled: false })
  ),
  http.post("http://localhost/api/auth/login/verify/", () =>
    HttpResponse.json({})
  ),
  http.post("http://localhost/api/auth/login/change-method/", () =>
    HttpResponse.json({ ephemeral_token: "new-eph", method: "app" })
  ),
  http.post("http://localhost/api/auth/login/resend/", () =>
    HttpResponse.json({})
  ),
  http.post("http://localhost/api/auth/logout/", () =>
    HttpResponse.json({})
  ),
  http.post("http://localhost/api/auth/registration/", () =>
    HttpResponse.json({}, { status: 201 })
  ),
  http.post("http://localhost/api/auth/registration/verify-email/", () =>
    HttpResponse.json({})
  ),
  http.post("http://localhost/api/auth/password/reset/", () =>
    HttpResponse.json({})
  ),
  http.post("http://localhost/api/auth/password/reset/confirm/", () =>
    HttpResponse.json({})
  ),
  http.post("http://localhost/api/auth/password/change/", () =>
    HttpResponse.json({})
  ),
  http.get("http://localhost/api/auth/user/", () =>
    HttpResponse.json({ email: "test@example.com" })
  ),

  // ── MFA ──────────────────────────────────────────────────────────────────
  http.get("http://localhost/api/auth/mfa/", () => HttpResponse.json([])),
  http.post("http://localhost/api/auth/mfa/", () =>
    HttpResponse.json({
      setup_data: { qr_code: "data:image/png;base64,abc" },
      backup_codes: ["code-1", "code-2", "code-3"],
    })
  ),
  http.post("http://localhost/api/auth/mfa/confirm/", () =>
    HttpResponse.json({})
  ),
  http.post("http://localhost/api/auth/mfa/primary/", () =>
    HttpResponse.json({})
  ),
  http.post("http://localhost/api/auth/mfa/deactivate/", () =>
    HttpResponse.json({})
  ),
  http.post("http://localhost/api/auth/mfa/delete/", () =>
    HttpResponse.json({})
  ),
  http.post("http://localhost/api/auth/mfa/send/", () =>
    HttpResponse.json({})
  ),

  // ── Social ───────────────────────────────────────────────────────────────
  http.get("http://localhost/api/auth/social/accounts/", () =>
    HttpResponse.json([])
  ),
  http.delete("http://localhost/api/auth/social/accounts/:id/", () =>
    new HttpResponse(null, { status: 204 })
  ),
  http.post("http://localhost/api/auth/social/google/", () =>
    HttpResponse.json({})
  ),
  http.post("http://localhost/api/auth/social/google/connect/", () =>
    HttpResponse.json({})
  ),

  // ── Wallet singletons ────────────────────────────────────────────────────
  http.get("http://localhost/api/wallet/legal-identities/", () =>
    new HttpResponse(null, { status: 404 })
  ),
  http.post("http://localhost/api/wallet/legal-identities/", () =>
    HttpResponse.json({
      given_name: "John",
      middle_name: "",
      family_name: "Doe",
      given_name_birth: "",
      family_name_birth: "",
      visibility: "private",
    })
  ),
  http.patch("http://localhost/api/wallet/legal-identities/", () =>
    HttpResponse.json({
      given_name: "John",
      middle_name: "",
      family_name: "Doe",
      given_name_birth: "",
      family_name_birth: "",
      visibility: "public",
    })
  ),

  http.get("http://localhost/api/wallet/date-of-birth/", () =>
    new HttpResponse(null, { status: 404 })
  ),
  http.post("http://localhost/api/wallet/date-of-birth/", () =>
    HttpResponse.json({ birth_date: "1990-01-01", visibility: "private" })
  ),
  http.patch("http://localhost/api/wallet/date-of-birth/", () =>
    HttpResponse.json({ birth_date: "1990-01-01", visibility: "private" })
  ),

  http.get("http://localhost/api/wallet/place-of-birth/", () =>
    new HttpResponse(null, { status: 404 })
  ),
  http.post("http://localhost/api/wallet/place-of-birth/", () =>
    HttpResponse.json({
      birth_city: "New York",
      birth_state: "NY",
      birth_country: "US",
      visibility: "private",
    })
  ),
  http.patch("http://localhost/api/wallet/place-of-birth/", () =>
    HttpResponse.json({
      birth_city: "New York",
      birth_state: "NY",
      birth_country: "US",
      visibility: "private",
    })
  ),

  // ── Wallet multi-record ───────────────────────────────────────────────────
  http.get("http://localhost/api/wallet/addresses/", () =>
    HttpResponse.json([])
  ),
  http.post("http://localhost/api/wallet/addresses/", () =>
    HttpResponse.json({
      id: "addr-1",
      address_type: "home",
      resident_street: "Main St",
      resident_house_number: "1",
      resident_city: "New York",
      resident_state: "NY",
      resident_postal_code: "10001",
      resident_country: "US",
      visibility: "private",
    })
  ),
  http.patch("http://localhost/api/wallet/addresses/:id/", () =>
    HttpResponse.json({
      id: "addr-1",
      address_type: "home",
      resident_street: "Updated St",
      resident_house_number: "2",
      resident_city: "Los Angeles",
      resident_state: "CA",
      resident_postal_code: "90001",
      resident_country: "US",
      visibility: "private",
    })
  ),
  http.delete("http://localhost/api/wallet/addresses/:id/", () =>
    new HttpResponse(null, { status: 204 })
  ),

  http.get("http://localhost/api/wallet/nationalities/", () =>
    HttpResponse.json([])
  ),
  http.post("http://localhost/api/wallet/nationalities/", () =>
    HttpResponse.json({ id: "nat-1", nationality: "US", visibility: "private" })
  ),
  http.patch("http://localhost/api/wallet/nationalities/:id/", () =>
    HttpResponse.json({ id: "nat-1", nationality: "GB", visibility: "private" })
  ),
  http.delete("http://localhost/api/wallet/nationalities/:id/", () =>
    new HttpResponse(null, { status: 204 })
  ),

  http.get("http://localhost/api/wallet/gender/", () =>
    HttpResponse.json([])
  ),
  http.post("http://localhost/api/wallet/gender/", () =>
    HttpResponse.json({ id: "gen-1", gender: "male", visibility: "private" })
  ),
  http.patch("http://localhost/api/wallet/gender/:id/", () =>
    HttpResponse.json({ id: "gen-1", gender: "female", visibility: "private" })
  ),
  http.delete("http://localhost/api/wallet/gender/:id/", () =>
    new HttpResponse(null, { status: 204 })
  ),

  http.get("http://localhost/api/wallet/professionals/", () =>
    HttpResponse.json([])
  ),
  http.post("http://localhost/api/wallet/professionals/", () =>
    HttpResponse.json({
      id: "prof-1",
      job_title: "Engineer",
      role_description: "",
      employee_number: "",
      visibility: "private",
    })
  ),
  http.patch("http://localhost/api/wallet/professionals/:id/", () =>
    HttpResponse.json({
      id: "prof-1",
      job_title: "Senior Engineer",
      role_description: "",
      employee_number: "",
      visibility: "private",
    })
  ),
  http.delete("http://localhost/api/wallet/professionals/:id/", () =>
    new HttpResponse(null, { status: 204 })
  ),

  http.get("http://localhost/api/wallet/online-profiles/", () =>
    HttpResponse.json([])
  ),
  http.post("http://localhost/api/wallet/online-profiles/", () =>
    HttpResponse.json({
      id: "online-1",
      platform: "github",
      username: "testuser",
      display_name: "Test User",
      visibility: "private",
    })
  ),
  http.patch("http://localhost/api/wallet/online-profiles/:id/", () =>
    HttpResponse.json({
      id: "online-1",
      platform: "github",
      username: "testuser2",
      display_name: "Test User 2",
      visibility: "private",
    })
  ),
  http.delete("http://localhost/api/wallet/online-profiles/:id/", () =>
    new HttpResponse(null, { status: 204 })
  ),

  http.get("http://localhost/api/wallet/daily-uses/", () =>
    HttpResponse.json([])
  ),
  http.post("http://localhost/api/wallet/daily-uses/", () =>
    HttpResponse.json({
      id: "daily-1",
      preferred_name: "Jo",
      nickname: "j",
      visibility: "private",
    })
  ),
  http.patch("http://localhost/api/wallet/daily-uses/:id/", () =>
    HttpResponse.json({
      id: "daily-1",
      preferred_name: "Joey",
      nickname: "joe",
      visibility: "private",
    })
  ),
  http.delete("http://localhost/api/wallet/daily-uses/:id/", () =>
    new HttpResponse(null, { status: 204 })
  ),

  http.get("http://localhost/api/wallet/credentials/", () =>
    HttpResponse.json([])
  ),
  http.post("http://localhost/api/wallet/credentials/", () =>
    HttpResponse.json({
      id: "cred-1",
      credential_id: "C1",
      credential_type: "government",
      credential_name: "Passport",
      credential_description: "",
      issuing_authority: "Gov",
      issuance_date: "2020-01-01",
      expiry_date: "2030-01-01",
      credential_url: "",
      visibility: "private",
    })
  ),
  http.patch("http://localhost/api/wallet/credentials/:id/", () =>
    HttpResponse.json({
      id: "cred-1",
      credential_id: "C1",
      credential_type: "government",
      credential_name: "Updated Passport",
      credential_description: "",
      issuing_authority: "Gov",
      issuance_date: "2020-01-01",
      expiry_date: "2030-01-01",
      credential_url: "",
      visibility: "private",
    })
  ),
  http.delete("http://localhost/api/wallet/credentials/:id/", () =>
    new HttpResponse(null, { status: 204 })
  ),

  http.get("http://localhost/api/wallet/custom-objects/", () =>
    HttpResponse.json([])
  ),
  http.post("http://localhost/api/wallet/custom-objects/", () =>
    HttpResponse.json({
      id: "cust-1",
      name_type: "my_type",
      name_value: "my_value",
      visibility: "private",
    })
  ),
  http.patch("http://localhost/api/wallet/custom-objects/:id/", () =>
    HttpResponse.json({
      id: "cust-1",
      name_type: "my_type",
      name_value: "updated_value",
      visibility: "private",
    })
  ),
  http.delete("http://localhost/api/wallet/custom-objects/:id/", () =>
    new HttpResponse(null, { status: 204 })
  ),

  http.get("http://localhost/api/wallet/access-logs/", () =>
    HttpResponse.json([])
  ),
]
