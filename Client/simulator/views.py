import base64
import hashlib
import json
import secrets
from urllib.parse import urlencode

import requests as http_requests

from django.conf import settings
from django.shortcuts import redirect, render


SCOPES = [
    ("openid", "OpenID Connect (required)"),
    ("legal_name", "Legal Name"),
    ("birthdate", "Birthdate"),
    ("over_18", "Age Verification (18+)"),
    ("place_of_birth", "Place of Birth"),
    ("address", "Address"),
    ("gender", "Gender"),
    ("nationality", "Nationality"),
    ("credentials", "Credentials / Qualifications"),
    ("professional_identity", "Professional Identity"),
    ("online_profile", "Online Profiles"),
    ("pseudonym", "Pseudonyms"),
    ("daily_use", "Daily Use Names"),
]


def _generate_code_verifier():
    return secrets.token_urlsafe(64)


def _compute_code_challenge(verifier):
    digest = hashlib.sha256(verifier.encode("ascii")).digest()
    return base64.urlsafe_b64encode(digest).rstrip(b"=").decode("ascii")


def home(request):
    return render(request, "simulator/home.html", {"scopes": SCOPES})


def authorize(request):
    if request.method != "POST":
        return redirect("home")

    selected_scopes = request.POST.getlist("scopes")
    if "openid" not in selected_scopes:
        selected_scopes.insert(0, "openid")
    scope_string = " ".join(selected_scopes)

    code_verifier = _generate_code_verifier()
    code_challenge = _compute_code_challenge(code_verifier)
    state = secrets.token_urlsafe(32)

    request.session["pkce_code_verifier"] = code_verifier
    request.session["oauth_state"] = state
    request.session.modified = True

    params = {
        "response_type": "code",
        "client_id": settings.WALLET_CLIENT_ID,
        "redirect_uri": settings.CLIENT_REDIRECT_URI,
        "scope": scope_string,
        "state": state,
        "code_challenge": code_challenge,
        "code_challenge_method": "S256",
    }
    auth_url = f"{settings.WALLET_BASE_URL}/o/authorize/?{urlencode(params)}"
    return redirect(auth_url)


def callback(request):
    returned_state = request.GET.get("state")
    stored_state = request.session.pop("oauth_state", None)
    if not returned_state or returned_state != stored_state:
        return render(request, "simulator/result.html", {
            "error": "State mismatch — possible CSRF attack or session expired."
        })

    error = request.GET.get("error")
    if error:
        description = request.GET.get("error_description", "")
        return render(request, "simulator/result.html", {
            "error": f"Authorization denied: {error}. {description}".strip()
        })

    code = request.GET.get("code")
    if not code:
        return render(request, "simulator/result.html", {"error": "No authorization code received."})

    code_verifier = request.session.pop("pkce_code_verifier", None)
    if not code_verifier:
        return render(request, "simulator/result.html", {
            "error": "Session expired — code_verifier not found. Please start again."
        })

    # Exchange authorization code for access token
    try:
        token_response = http_requests.post(
            f"{settings.WALLET_BASE_URL}/o/token/",
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": settings.CLIENT_REDIRECT_URI,
                "client_id": settings.WALLET_CLIENT_ID,
                "client_secret": settings.WALLET_CLIENT_SECRET,
                "code_verifier": code_verifier,
            },
            timeout=10,
        )
    except http_requests.RequestException as exc:
        return render(request, "simulator/result.html", {"error": f"Token request failed: {exc}"})

    if token_response.status_code != 200:
        return render(request, "simulator/result.html", {
            "error": f"Token exchange failed ({token_response.status_code}): {token_response.text}"
        })

    token_data = token_response.json()
    access_token = token_data.get("access_token")

    # Fetch userinfo with the access token
    try:
        userinfo_response = http_requests.get(
            f"{settings.WALLET_BASE_URL}/o/userinfo/",
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=10,
        )
    except http_requests.RequestException as exc:
        return render(request, "simulator/result.html", {"error": f"Userinfo request failed: {exc}"})

    if userinfo_response.status_code != 200:
        return render(request, "simulator/result.html", {
            "error": f"Userinfo call failed ({userinfo_response.status_code}): {userinfo_response.text}"
        })

    request.session["userinfo"] = userinfo_response.json()
    request.session["scopes_granted"] = token_data.get("scope", "")
    return redirect("result")


def result(request):
    userinfo = request.session.pop("userinfo", None)
    scopes_granted = request.session.pop("scopes_granted", "")
    if userinfo is None:
        return redirect("home")
    return render(request, "simulator/result.html", {
        "userinfo": json.dumps(userinfo, indent=2),
        "scopes_granted": scopes_granted,
    })
