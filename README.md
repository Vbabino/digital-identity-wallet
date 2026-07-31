# TrustVault — Digital Identity Wallet

A privacy-first digital identity wallet that lets users store, organise, and selectively disclose identity attributes to third-party applications via a standards-compliant OAuth2/OIDC provider.

[![CI/CD Pipeline with Security Gates](https://github.com/Vbabino/digital-identity-wallet/actions/workflows/cicd.yml/badge.svg)](https://github.com/Vbabino/digital-identity-wallet/actions/workflows/cicd.yml)

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Security Design](#security-design)
  - [RS256 for OIDC ID Token Signing](#rs256-for-oidc-id-token-signing)
  - [PKCE on Every Authorization Flow](#pkce-on-every-authorization-flow)
  - [Session Hijacking Prevention](#session-hijacking-prevention)
  - [DynamicScopesBackend and User Privacy](#dynamicscopesbackend-and-user-privacy)
  - [Multi-Factor Authentication](#multi-factor-authentication)
  - [Social Login Hardening](#social-login-hardening)
  - [API Rate Limiting](#api-rate-limiting)
  - [Dependency Pinning](#dependency-pinning)
- [CI/CD Security Pipeline](#cicd-security-pipeline)
- [Project Layout](#project-layout)
- [Quick Start](#quick-start)
  - [Backend](#backend)
  - [Frontend](#frontend)
  - [Client App Simulator](#client-app-simulator)
- [Running the Tests](#running-the-tests)
- [API Reference](#api-reference)

---

## Overview

TrustVault gives users fine-grained control over which identity attributes they share with OAuth2 relying parties. Rather than exposing a flat user profile, every attribute — legal name, birthdate, address, credentials, pseudonyms — is individually subject to a **PrivacyMetadata** record. An attribute is only included in an OIDC `userinfo` response when the user has explicitly marked it as public *and* the third-party app was granted the matching scope.

The stack is a Django 6 backend acting as an OAuth2/OIDC provider (via `django-oauth-toolkit`), a React Router 7 SPA frontend, and a standalone client simulator that demonstrates the full Authorization Code + PKCE round-trip.

---

## Architecture

```
┌─────────────────────────────────────────────┐
│                   Frontend                  │
│  React Router 7 + TypeScript + Tailwind v4  │
│  http://localhost:5173                      │
└────────────────────┬────────────────────────┘
                     │ REST (JWT cookie auth)
                     │ OAuth2 PKCE (Google sign-in / connect)
┌────────────────────▼────────────────────────┐
│                   Backend                   │
│  Django 6 · django-oauth-toolkit (OIDC)     │
│  drf-auth-kit (JWT cookies, MFA, social)    │
│  http://localhost:8000                      │
│                                             │
│  /api/wallet/   — identity REST API         │
│  /api/auth/     — registration, JWT, MFA    │
│  /o/            — OAuth2/OIDC endpoints     │
│  /admin/        — Django admin              │
└────────────────────┬────────────────────────┘
                     │ Authorization Code + PKCE
┌────────────────────▼────────────────────────┐
│            Client App Simulator             │
│  Standalone Django project                  │
│  http://localhost:8001                      │
│  Demonstrates the full OIDC relying-party   │
│  flow and displays the userinfo payload     │
└─────────────────────────────────────────────┘
```

### Key backend models (all with UUID primary keys)

| Model | Description |
|---|---|
| `CustomUser` | Email-based auth (no username field) |
| `LegalIdentity` | OneToOne — legal name and family details |
| `ProfessionalIdentity` | Job title, employer, industry |
| `OnlineProfile` | Social handles, websites |
| `Pseudonym` / `DailyUse` | Alternate names |
| `Age` / `PlaceOfBirth` | Singletons, OneToOne |
| `Address` / `Gender` / `Nationality` | Multi-record |
| `Credential` | Issued credentials (driving licence, degree, etc.) |
| `CustomObject` | Freeform identity attributes — feeds dynamic scopes |
| `PrivacyMetadata` | Controls visibility for every identity record |
| `AccessLog` | Audit log of every OAuth2 scope access |

---

## Security Design

### RS256 for OIDC ID Token Signing

ID tokens are signed with **RS256** (RSA + SHA-256 asymmetric signatures) rather than HS256.

The practical difference matters for a multi-party system:

- **HS256** uses a shared secret. Any relying party that can verify tokens could also *forge* them — the same key signs and verifies.
- **RS256** keeps the private key exclusively on the wallet server. Relying parties only ever hold the public key (exposed at `/o/.well-known/jwks.json`). A compromised client cannot mint tokens it can verify.

The private key is loaded at runtime from the `OIDC_RSA_PRIVATE_KEY` environment variable; it never touches the codebase or the database. The `django-oauth-toolkit` OIDC layer uses this key to sign tokens and publishes the corresponding public key material at the standard JWK endpoint, so any conformant relying party can verify tokens without trusting the wallet to tell it anything extra.

```python
# config/settings.py
OAUTH2_PROVIDER = {
    "OIDC_ENABLED": True,
    "OIDC_RSA_PRIVATE_KEY": os.getenv("OIDC_RSA_PRIVATE_KEY"),  # never hard-coded
    ...
}
```

The client simulator registers its application with `Algorithm: RS256` in the admin, making the asymmetric trust chain explicit in the configuration.

---

### PKCE on Every Authorization Flow

**Proof Key for Code Exchange (PKCE, RFC 7636)** is enforced at the provider level:

```python
# config/settings.py
OAUTH2_PROVIDER = {
    "OAUTH_PKCE_ENABLED": True,
    ...
}
```

This closes the **authorization-code interception attack**. Without PKCE, if a malicious app on the same device intercepts the redirect containing the authorization code, it can exchange that code for tokens. PKCE binds the code to a one-time secret (the `code_verifier`) that only the legitimate initiating process can produce.

The S256 challenge method is used throughout: the client sends a SHA-256 hash of the verifier upfront, and the server re-derives and compares it on token exchange. The plain `code_verifier` is never sent until the exchange, so interception of the authorization response yields nothing usable.

PKCE is applied to **three separate flows** in this project:

1. **OAuth2 Authorization Code flow** — the relying-party simulator and any third-party client.
2. **Google social login** — the React frontend performs PKCE against Google's OAuth2 endpoint, then exchanges the authorization code (plus verifier) with the wallet's `/api/auth/social/google/` endpoint.
3. **Google account linking** — authenticated users connecting a Google account use the same PKCE flow via `/api/auth/social/google/connect/`.

The PKCE integration tests verify all three enforcement properties directly against the live token endpoint:

```python
def test_pkce_missing_verifier_rejected(pkce_code):
    # → 400, no token issued

def test_pkce_wrong_verifier_rejected(pkce_code):
    # → 400, mismatched verifier

def test_pkce_correct_verifier_succeeds(pkce_code):
    # → 200, access_token present
```

---

### Session Hijacking Prevention

Several independent layers protect session and token state:

**Short-lived JWT access tokens**
Access tokens expire in 10 minutes. Refresh tokens in 30 minutes. A stolen token has a narrow window of usefulness.

```python
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=10),
    "REFRESH_TOKEN_LIFETIME": timedelta(minutes=30),
}
```

**HttpOnly JWT cookies**
`drf-auth-kit` stores JWT access and refresh tokens in `HttpOnly` cookies (`USE_AUTH_COOKIE = True`). JavaScript running in the browser — including injected scripts from an XSS attack — cannot read them. A successful XSS attack cannot exfiltrate the session tokens.

**SameSite cookie policy**
Both the CSRF cookie and the session cookie carry `SameSite=Lax`. This prevents cross-site request forgery (CSRF) by blocking the browser from attaching cookies on cross-origin form posts and navigations, while still allowing normal same-site navigation.

```python
CSRF_COOKIE_SAMESITE = "Lax"
SESSION_COOKIE_SAMESITE = "Lax"
```

**CORS and CSRF origin enforcement**
The allowed CORS origins and CSRF trusted origins are read from environment variables rather than being hard-coded. In production the wildcard is replaced with the exact frontend origin.

```python
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [...]   # env-driven
CSRF_TRUSTED_ORIGINS = [...]   # env-driven
```

**Session cookie isolation between services**
The client simulator and the wallet both run on `localhost` but on different ports. Browsers key cookies by hostname (not port), so a naive setup would have the simulator's session cookie collide with the wallet's, letting the PKCE `state` value get overwritten mid-flow. The simulator sets `SESSION_COOKIE_NAME = "simulator_sessionid"` to maintain isolation.

**Content-type sniffing and referrer policy**
```python
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"
```
`X-Content-Type-Options: nosniff` stops browsers from inferring a MIME type different from the declared one, which blocks a class of attacks that rely on tricking the browser into executing content as script. The referrer policy ensures sensitive URL paths are not leaked in the `Referer` header to external resources.

**MFA ephemeral token expiry**
After a successful first factor (email/password), the backend issues a short-lived ephemeral token (15 minutes) used only to complete the MFA step. It cannot be used to authenticate as the user; it can only be paired with a valid TOTP or email OTP to proceed. An attacker who steals the ephemeral token alone gains nothing.

```python
"MFA_EPHEMERAL_TOKEN_EXPIRY": 300,  # 5 minutes
```

---

### DynamicScopesBackend and User Privacy

The `DynamicScopesBackend` (`wallet/scopes_backend.py`) is where user-controlled privacy meets the OAuth2 scope system.

**How scopes map to data**

The wallet defines 12 static OIDC scopes (`legal_name`, `birthdate`, `address`, `credentials`, etc.) plus a class of dynamic scopes generated at runtime from `CustomObject.name_type` values stored in the database:

```python
class DynamicScopesBackend(BaseScopes):
    def get_all_scopes(self):
        scopes = dict(STATIC_SCOPES)
        for name_type in CustomObject.objects.values_list(
            "name_type", flat=True
        ).distinct():
            scope_key = f"custom_name:{name_type}"
            scopes[scope_key] = f"Access to user's {name_type.replace('_', ' ')}"
        return scopes
```

A user who adds a `CustomObject` with `name_type = "gaming_alias"` causes `custom_name:gaming_alias` to appear as a requestable scope — but only that user's gaming alias is ever disclosed, and only when they mark it public.

**The two-gate model**

Receiving an access token with scope `address` does not automatically reveal the user's address. The `CustomOAuth2Validator` checks *both* gates before including any claim in the `userinfo` response:

1. **Gate 1 — scope granted**: The relying party must have been granted the scope for this token.
2. **Gate 2 — PrivacyMetadata is public**: The individual record must carry `PrivacyMetadata.visibility = PUBLIC`. Records marked private are excluded at the database query level — they are not fetched, not serialised, and not returned.

```python
# wallet/oauth_validators.py — example for multi-record models
def _get_address(request):
    return [
        {...}
        for a in request.user.addresses.filter(
            privacy_metadata__visibility=PrivacyMetadata.PUBLIC
        )
    ]

# Example for singleton models (OneToOne)
def _get_legal_name(request):
    if not hasattr(request.user, "legal_identity"):
        return None
    li = request.user.legal_identity
    if not li.privacy_metadata.is_public:
        return None          # key omitted from userinfo entirely
    return {"family_name": li.family_name, ...}
```

If the record is private, the claim key is **omitted entirely** from the response — not returned as `null`. A relying party cannot even infer whether the attribute exists.

The `AccessLog` model records every `userinfo` call with the scopes requested and claims actually returned, giving users a full audit trail of what was disclosed and to whom.

---

### Multi-Factor Authentication

MFA is enforced at the backend (`USE_MFA = True`) with two available methods: TOTP authenticator app and email OTP. Key security properties:

- **Backup codes** are stored as secure hashes (`BACKUP_CODE_SECURE_HASH = True`) — the plaintext code is shown once and never stored.
- The **primary MFA method cannot be deleted** without first activating a replacement (`MFA_PREVENT_DELETE_PRIMARY_METHOD = True`).
- **Deleting an active method requires a valid OTP** (`MFA_DELETE_ACTIVE_METHOD_REQUIRE_CODE = True`) — protecting against an attacker who gains brief physical access to an unlocked session.
- TOTP clock skew tolerance is set to `±1 window` (3 codes checked), which is the minimum needed for a usable app while avoiding multi-window replay windows.
- Password reset and email verification links point to the React frontend (not the Django admin), and are single-use tokens issued by Django's auth framework.

---

### Social Login Hardening

Google OAuth is integrated with several explicit security choices:

**Auto-connect is disabled**

```python
SOCIALACCOUNT_EMAIL_AUTHENTICATION_AUTO_CONNECT = False
```

Auto-connecting a Google account to an existing password account based solely on a matching email address is a classic account-takeover vector: if Google (or any social provider) does not enforce email verification at the app layer, an attacker can register a Google account with the victim's email and gain access to the victim's wallet account. Auto-connect is therefore disabled. Users must initiate the account-link action explicitly while already authenticated.

**FETCH_USERINFO is False**

The allauth `FETCH_USERINFO` setting is intentionally false for the same reason — relying on the `email_verified` claim in the ID token rather than fetching it independently would require trusting the provider to set it correctly. The current flow avoids that dependency entirely.

**Social connect requires email match**

`SOCIAL_CONNECT_REQUIRE_EMAIL_MATCH` (default `True`) ensures that the Google account being linked has the same email address as the authenticated TrustVault account, preventing a user from accidentally (or maliciously) linking someone else's Google account.

**PKCE on the social callback**

The `PKCESocialLoginWithCodeSerializer` and `PKCESocialConnectSerializer` (`wallet/social_serializers.py`) extend the auth-kit serializers with an optional `code_verifier` field, wrapping the entire code exchange in `transaction.atomic()`. If any part of the social login fails (token exchange, user lookup, account creation), the transaction rolls back cleanly.

---

### API Rate Limiting

DRF throttling is enabled globally:

| Client type | Limit |
|---|---|
| Anonymous | 30 requests / minute |
| Authenticated user | 300 requests / minute |

This provides a baseline defence against credential-stuffing and enumeration attacks on the authentication and wallet endpoints without requiring a separate rate-limiting proxy in development.

---

### Dependency Pinning

Critical CVE patches are pinned directly in `Backend/requirements.txt`:

| Package | Minimum version | Vulnerability |
|---|---|---|
| `PyJWT` | `>=2.13.0` | CVE-2026-48526 — auth bypass via forged JWT |
| `cryptography` | `>=48.0.1` | GHSA-537c-gmf6-5ccf — vulnerable OpenSSL in wheels |

Frontend transitive dependency overrides in `Frontend/package.json`:

| Package | Reason |
|---|---|
| `hono@4.12.25` | Transitive via `shadcn → @modelcontextprotocol/sdk → hono`; no direct upgrade path |
| `form-data@4.0.6` | Transitive via `axios → form-data`; patched via npm overrides |

---

## CI/CD Security Pipeline

Every push and pull request to `main` runs five jobs in GitHub Actions. Four run in parallel; SonarCloud runs after both test jobs complete.

```
push / PR to main
       │
       ├── test             pytest + coverage → coverage.xml artifact
       ├── trivy            Dependency vulnerability scan (HIGH/CRITICAL gate)
       ├── bandit           Python SAST scan (MEDIUM+ severity gate)
       ├── frontend-tests   Vitest + coverage → lcov artifact
       │
       └── sonarqube        Downloads both artifacts → SonarCloud analysis
```

### Job details

**`test`** — Runs the full pytest suite (300 tests) with coverage. Uploads `coverage.xml` for SonarCloud. Fails the build on any test failure.

**`trivy`** — Scans all dependencies (Python + npm) for known CVEs. Two passes:
- *Security gate*: table format, `exit-code: 1` on HIGH/CRITICAL findings. Blocks merge.
- *Dashboard pass*: SARIF format, `exit-code: 0`, always runs. Uploads findings to the GitHub Security tab.

The two-pass design works around a Trivy quirk where SARIF output can exit non-zero even with zero findings, which would cause false failures. `scanners: vuln` restricts Trivy to dependency vulnerabilities only — secrets are handled by gitleaks pre-commit hooks and misconfigurations by Bandit, avoiding duplicate noise.

**`bandit`** — Python SAST with `-ll -ii` flags (blocks on MEDIUM severity, MEDIUM confidence). Scans `Backend/` only. Report uploaded as a build artifact for review.

**`frontend-tests`** — Runs `npm run test:coverage` (Vitest). Fails on any test failure. Uploads the lcov report for SonarCloud JavaScript coverage.

**`sonarqube`** — Downloads both coverage artifacts and pushes to SonarCloud. Non-blocking quality analysis (does not gate the PR) but surfaces code smells, duplication, and security hotspots for manual review.

### Required GitHub secrets

| Secret | Used by |
|---|---|
| `DJANGO_SECRET_KEY` | `test` job — required for JWT middleware in view tests |
| `SONAR_TOKEN` | `sonarqube` job — SonarCloud authentication |

---

## Project Layout

```
digital-identity-wallet/
├── Backend/                    Django project
│   ├── config/
│   │   ├── settings.py
│   │   └── urls.py
│   ├── wallet/
│   │   ├── models.py           14 models (UUID PKs)
│   │   ├── serializers.py      DRF serializers + PrivacyMetadataMixin
│   │   ├── views.py            REST API views
│   │   ├── oauth_validators.py OIDC scope → claim mapping
│   │   ├── scopes_backend.py   DynamicScopesBackend
│   │   ├── social_serializers.py PKCE social login/connect
│   │   ├── factories.py        Factory Boy test factories
│   │   └── tests/
│   │       ├── conftest.py
│   │       ├── test_models.py        115 tests
│   │       ├── test_serializers.py    80 tests
│   │       ├── test_views.py          99 tests
│   │       ├── test_scopes_backend.py 10 tests
│   │       └── test_pkce.py            3 integration tests
│   └── requirements.txt
├── Frontend/                   React Router 7 SPA (TrustVault)
│   ├── app/
│   │   ├── routes/             File-based routes
│   │   ├── components/         Shared UI components
│   │   ├── lib/                Utilities (pkce.ts, errors.ts)
│   │   └── services/api.ts     Axios instance
│   └── package.json
├── Client/                     OAuth2 relying-party simulator
│   └── simulator/
│       └── views.py            Full PKCE Authorization Code flow
├── .github/workflows/
│   └── cicd.yml                Five-job CI/CD pipeline
├── sonar-project.properties    SonarCloud config
└── trivy.yaml                  Trivy ignore rules
```

---

## Quick Start

### Backend

```bash
cd Backend

# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install --require-hashes -r requirements.txt

# Copy and populate environment variables
cp .env.example .env   # set DJANGO_SECRET_KEY and OIDC_RSA_PRIVATE_KEY

# Apply migrations
python manage.py migrate

# Create a superuser for the admin
python manage.py createsuperuser

# Start the dev server
python manage.py runserver
```

**Generating an RSA key for OIDC:**
```bash
openssl genrsa -out oidc.pem 4096
# Paste the contents of oidc.pem into OIDC_RSA_PRIVATE_KEY in .env
```

**Key URLs:**
- Admin: `http://localhost:8000/admin/`
- Swagger: `http://localhost:8000/api/docs/`
- OAuth2 endpoints: `http://localhost:8000/o/`
- Auth (JWT/MFA/social): `http://localhost:8000/api/auth/`
- Wallet REST API: `http://localhost:8000/api/wallet/`

### Frontend

```bash
cd Frontend
npm install

# Populate environment variables
cp .env.example .env   # set VITE_GOOGLE_CLIENT_ID and VITE_GOOGLE_REDIRECT_URI

# Dev server with HMR
npm run dev
```

**Key URLs:**
- App: `http://localhost:5173`

### Client App Simulator

```bash
# 1. In the Django admin, create an OAuth2 Application:
#    Client type: Confidential
#    Grant type:  Authorization code
#    Redirect URI: http://localhost:8001/callback/
#    Algorithm: RS256

# 2. Copy the generated Client ID and Secret into Client/.env

cd Client
pip install -r requirements.txt
python manage.py migrate          # creates the sessions table
python manage.py runserver 8001
```

Visit `http://localhost:8001`, select scopes, and walk through the full PKCE Authorization Code flow against the wallet.

---

## Running the Tests

### Backend (pytest)

```bash
cd Backend

# Full suite with coverage
.venv/bin/pytest wallet/tests/ --cov=wallet --cov-report=term-missing

# Single file
.venv/bin/pytest wallet/tests/test_pkce.py -v

# Coverage report only
.venv/bin/pytest wallet/tests/ --cov=wallet --cov-report=xml
```

300 tests across five files. Current coverage: 100% on models, serializers, views, scopes backend, and PKCE integration.

### Frontend (Vitest)

```bash
cd Frontend

# Run once (CI mode)
npm run test:run

# Watch mode
npm test

# With lcov coverage report
npm run test:coverage
```

142 tests across 14 files. Covers utility functions, all auth routes, dashboard hooks, and component behaviour with MSW network interception.

### Linting and Type Checking

```bash
# Backend
cd Backend && .venv/bin/bandit -r wallet/ -ll -ii

# Frontend lint
cd Frontend && npx eslint .

# Frontend type check
cd Frontend && npx tsc --noEmit --ignoreDeprecations 5.0
```

---

## API Reference

The OpenAPI schema is auto-generated by `drf-spectacular` and served at:

- **Swagger UI**: `http://localhost:8000/api/docs/`
- **Raw schema (YAML)**: `http://localhost:8000/api/schema/`
- **Static copy**: `Backend/schema.yaml`

### OIDC endpoints (django-oauth-toolkit)

| Endpoint | Description |
|---|---|
| `GET /o/authorize/` | Authorization endpoint — redirects user to consent screen |
| `POST /o/token/` | Token endpoint — exchanges code + verifier for access token |
| `GET /o/userinfo/` | Returns claims for the granted scopes (privacy-filtered) |
| `GET /o/.well-known/openid-configuration/` | OIDC discovery document |
| `GET /o/.well-known/jwks.json` | Public RSA key set for token verification |
| `POST /o/revoke_token/` | Revokes an access or refresh token |
| `POST /o/introspect/` | Token introspection (RFC 7662) |

### Auth endpoints (drf-auth-kit)

| Endpoint | Description |
|---|---|
| `POST /api/auth/registration/` | Create account |
| `POST /api/auth/registration/verify-email/` | Verify email address |
| `POST /api/auth/login/` | Credential login → JWT cookies or MFA ephemeral token |
| `POST /api/auth/login/verify/` | Complete MFA second factor |
| `POST /api/auth/login/change-method/` | Switch MFA method mid-flow |
| `POST /api/auth/logout/` | Clear JWT cookies |
| `POST /api/auth/password/reset/` | Request password reset email |
| `POST /api/auth/password/reset/confirm/` | Set new password |
| `POST /api/auth/password/change/` | Change password (authenticated) |
| `POST /api/auth/social/google/` | Google PKCE login |
| `POST /api/auth/social/google/connect/` | Link Google account (authenticated) |
| `GET /api/auth/social/accounts/` | List connected social accounts |
| `DELETE /api/auth/social/accounts/{id}/` | Disconnect social account |

### Wallet REST API endpoints

All endpoints require authentication. Users can only access their own records.

| Endpoint | Type | Description |
|---|---|---|
| `GET/POST/PUT/PATCH /api/wallet/legal-identities/` | Singleton | Legal name |
| `GET/POST/PUT/PATCH /api/wallet/date-of-birth/` | Singleton | Age / birthdate |
| `GET/POST/PUT/PATCH /api/wallet/place-of-birth/` | Singleton | Place of birth |
| `GET/POST/PUT/PATCH /api/wallet/addresses/` | Multi-record | Postal addresses |
| `GET/POST/PUT/PATCH /api/wallet/gender/` | Multi-record | Gender |
| `GET/POST/PUT/PATCH /api/wallet/nationalities/` | Multi-record | Nationalities |
| `GET/POST/PUT/PATCH /api/wallet/credentials/` | Multi-record | Issued credentials |
| `GET/POST/PUT/PATCH /api/wallet/professionals/` | Multi-record | Professional identities |
| `GET/POST/PUT/PATCH /api/wallet/online-profiles/` | Multi-record | Online profiles |
| `GET/POST/PUT/PATCH /api/wallet/pseudonyms/` | Multi-record | Pseudonyms |
| `GET/POST/PUT/PATCH /api/wallet/daily-uses/` | Multi-record | Daily-use names |
| `GET/POST/PUT/PATCH /api/wallet/custom-objects/` | Multi-record | Custom attributes |
| `GET /api/wallet/access-logs/` | Read-only | OAuth2 access audit log |

Every write endpoint accepts a `visibility` field (`"public"` or `"private"`) that controls whether the record is disclosed in `userinfo` responses.
