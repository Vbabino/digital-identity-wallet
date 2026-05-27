"""
PKCE-enabled social login serializer.

Extends auth-kit's SocialLoginWithCodeRequestSerializer to accept a
code_verifier from the frontend and forward it to the OAuth token exchange,
implementing the full PKCE S256 flow for frontend-initiated OAuth.
"""

from typing import Any, cast

from rest_framework import serializers
from rest_framework.request import Request

from allauth.socialaccount.providers.oauth2.client import OAuth2Client, OAuth2Error

from auth_kit.allauth_enhanced import OpenIDConnectOAuth2Adapter
from auth_kit.app_settings import auth_kit_settings
from auth_kit.serializer_fields import UnquoteStringField
from auth_kit.serializers.login_factors import get_login_response_serializer
from auth_kit.social.serializers.login import SocialLoginWithCodeRequestSerializer


class PKCESocialLoginWithCodeSerializer(SocialLoginWithCodeRequestSerializer):
    """
    Extends the standard authorization-code serializer with PKCE support.

    Accepts an optional `code_verifier` from the client and forwards it to
    the provider's token endpoint so Google can verify the S256 challenge
    that was attached to the original authorization request.
    """

    code_verifier = UnquoteStringField(required=False, allow_blank=True, write_only=True)

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        from auth_kit.social.views import SocialLoginView  # local import avoids circular

        view = cast(SocialLoginView, self.context.get("view"))
        request = cast(Request, self.context.get("request"))

        adapter_class = view.adapter_class

        provider_id = view.kwargs.get("provider_id")
        if provider_id:
            adapter_class = cast(type[OpenIDConnectOAuth2Adapter], adapter_class)
            adapter = adapter_class(request, provider_id)
        else:
            adapter = adapter_class(request)

        app = adapter.get_provider().app

        code = attrs.get("code")
        code_verifier = attrs.get("code_verifier") or None

        callback_url = self.get_callback_url(request, view, app)
        client_class = getattr(view, "client_class", OAuth2Client)

        client = client_class(
            request,
            app.client_id,
            app.secret,
            adapter.access_token_method,
            adapter.access_token_url,
            callback_url,
            scope_delimiter=adapter.scope_delimiter,
            headers=adapter.headers,
            basic_auth=adapter.basic_auth,
        )

        try:
            token = client.get_access_token(code, pkce_code_verifier=code_verifier)
        except OAuth2Error as e:
            err_msg: Any = str(e)
            if auth_kit_settings.SOCIAL_HIDE_AUTH_ERROR_DETAILS:
                err_msg = "Failed to exchange code for access token"
            raise serializers.ValidationError(err_msg) from e

        access_token = token["access_token"]
        tokens_to_parse: dict[str, Any] = {"access_token": access_token}
        for key in ["refresh_token", "id_token", adapter.expires_in_key]:
            if key in token:
                tokens_to_parse[key] = token[key]

        login = self.get_login_from_token(tokens_to_parse)
        self.post_signup(login, attrs)
        self.context["user"] = login.account.user

        return attrs


def get_pkce_social_login_serializer(
    provider_name: str = "",
) -> type[serializers.Serializer]:  # type: ignore[type-arg]
    """
    Serializer factory for AUTH_KIT["SOCIAL_LOGIN_SERIALIZER_FACTORY"].

    Returns a combined serializer class using PKCESocialLoginWithCodeSerializer
    as the request half, so the token exchange carries the PKCE verifier.
    """
    response_serializer = get_login_response_serializer()

    class_name = (
        f"{provider_name}PKCESocialLoginSerializer"
        if provider_name
        else "PKCESocialLoginSerializer"
    )

    return type(
        class_name,
        (response_serializer, PKCESocialLoginWithCodeSerializer),
        {
            "__doc__": (
                f"Social authentication with {provider_name} OAuth credentials response (PKCE)."
                if provider_name
                else "Social authentication with OAuth credentials response (PKCE)."
            ),
            "__module__": __name__,
        },
    )
