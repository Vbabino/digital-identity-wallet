"""
Integration tests for PKCE enforcement on the wallet's OAuth2 token endpoint.

These tests verify that the wallet (acting as OAuth2 provider) correctly
rejects token exchange requests when the code_verifier is missing or wrong,
and accepts the exchange when it is correct.

No external services are involved — both the authorization and token steps
hit the wallet's own /o/authorize/ and /o/token/ endpoints in-process.
"""

import base64
import hashlib
import secrets
from urllib.parse import parse_qs, urlparse

import pytest
from django.test import Client
from oauth2_provider.models import Application

from wallet.factories import CustomUserFactory

REDIRECT_URI = "http://localhost:8001/callback/"


def _pkce_pair() -> tuple[str, str]:
    """Generate a (code_verifier, code_challenge) pair using S256."""
    verifier = secrets.token_urlsafe(64)
    digest = hashlib.sha256(verifier.encode("ascii")).digest()
    challenge = base64.urlsafe_b64encode(digest).rstrip(b"=").decode("ascii")
    return verifier, challenge


@pytest.fixture
def pkce_code(db):
    """
    Complete a PKCE authorization and return (code, code_verifier, app, raw_secret).

    Uses `legal_name` scope (not `openid`) to avoid requiring OIDC_RSA_PRIVATE_KEY,
    which is not set in the CI environment.

    DOT hashes client_secret on .save(), so the plain text is captured before
    the call to .save() and returned alongside the Application instance.
    """
    app = Application(
        name="Test Client",
        client_type=Application.CLIENT_CONFIDENTIAL,
        authorization_grant_type=Application.GRANT_AUTHORIZATION_CODE,
        redirect_uris=REDIRECT_URI,
        user=CustomUserFactory(),
    )
    raw_secret = app.client_secret  # plain text — DOT hashes it on .save()
    app.save()

    code_verifier, code_challenge = _pkce_pair()

    django_client = Client()
    django_client.force_login(CustomUserFactory())
    response = django_client.post(
        "/o/authorize/",
        {
            "response_type": "code",
            "client_id": app.client_id,
            "redirect_uri": REDIRECT_URI,
            "scope": "legal_name",
            "code_challenge": code_challenge,
            "code_challenge_method": "S256",
            "allow": "true",
        },
    )

    assert response.status_code == 302, (
        f"Authorization failed ({response.status_code}): {response.content[:200]}"
    )
    location = response["Location"]
    query = parse_qs(urlparse(location).query)
    assert "code" in query, f"Expected authorization code in redirect URL: {location}"
    code = query["code"][0]
    return code, code_verifier, app, raw_secret


def test_pkce_missing_verifier_rejected(pkce_code):
    """Token exchange without code_verifier must be rejected (400) when PKCE was used during authorization."""
    code, _, app, raw_secret = pkce_code

    response = Client().post(
        "/o/token/",
        {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": REDIRECT_URI,
            "client_id": app.client_id,
            "client_secret": raw_secret,
        },
    )

    assert response.status_code == 400
    assert "error" in response.json()


def test_pkce_wrong_verifier_rejected(pkce_code):
    """Token exchange with a mismatched code_verifier must be rejected (400)."""
    code, _, app, raw_secret = pkce_code
    wrong_verifier = secrets.token_urlsafe(64)

    response = Client().post(
        "/o/token/",
        {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": REDIRECT_URI,
            "client_id": app.client_id,
            "client_secret": raw_secret,
            "code_verifier": wrong_verifier,
        },
    )

    assert response.status_code == 400
    assert "error" in response.json()


def test_pkce_correct_verifier_succeeds(pkce_code):
    """Token exchange with the correct code_verifier must succeed and return an access token."""
    code, code_verifier, app, raw_secret = pkce_code

    response = Client().post(
        "/o/token/",
        {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": REDIRECT_URI,
            "client_id": app.client_id,
            "client_secret": raw_secret,
            "code_verifier": code_verifier,
        },
    )

    assert response.status_code == 200
    assert "access_token" in response.json()
