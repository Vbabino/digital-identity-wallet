from datetime import date
import logging
from oauth2_provider.oauth2_validators import OAuth2Validator
from wallet.models import PrivacyMetadata

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Scope handler functions
# Each function receives the OAuth2 request and returns the claim value.
# Handlers for OneToOne relations return None when the record is private;
# the caller omits the claim key entirely in that case.
# Handlers for many/FK relations filter to public records at the DB level.
# ---------------------------------------------------------------------------

def _get_birthdate(request):
    if not hasattr(request.user, 'age'):
        return None
    age = request.user.age
    if not age.privacy_metadata.is_public:
        return None
    return str(age.birth_date)


def _get_over_18(request):
    if not hasattr(request.user, 'age'):
        return None
    age = request.user.age
    if not age.privacy_metadata.is_public:
        return None
    today = date.today()
    years = today.year - age.birth_date.year - (
        (today.month, today.day) < (age.birth_date.month, age.birth_date.day)
    )
    return years >= 18


def _get_place_of_birth(request):
    if not hasattr(request.user, 'place_of_birth'):
        return None
    pob = request.user.place_of_birth
    if not pob.privacy_metadata.is_public:
        return None
    return pob.birth_city


def _get_address(request):
    return [
        {
            "address_type": a.address_type,
            "house_number": a.resident_house_number,
            "street": a.resident_street,
            "city": a.resident_city,
            "state": a.resident_state,
            "postal_code": a.resident_postal_code,
            "country": str(a.resident_country),
        }
        for a in request.user.addresses.filter(
            privacy_metadata__visibility=PrivacyMetadata.PUBLIC
        )
    ]


def _get_gender(request):
    return [
        g.gender
        for g in request.user.genders.filter(
            privacy_metadata__visibility=PrivacyMetadata.PUBLIC
        )
    ]


def _get_nationality(request):
    return [
        str(n.nationality)
        for n in request.user.nationalities.filter(
            privacy_metadata__visibility=PrivacyMetadata.PUBLIC
        )
    ]


def _get_credentials(request):
    return [
        {
            "id": c.credential_id,
            "name": c.credential_name,
            "type": c.credential_type,
            "description": c.credential_description,
            "issuing_authority": c.issuing_authority,
            "issuance_date": str(c.issuance_date),
            "expiry_date": str(c.expiry_date),
            "credential_url": c.credential_url,
        }
        for c in request.user.credentials.filter(
            privacy_metadata__visibility=PrivacyMetadata.PUBLIC
        )
    ]


def _get_legal_name(request):
    if not hasattr(request.user, 'legal_identity'):
        return None
    li = request.user.legal_identity
    if not li.privacy_metadata.is_public:
        return None
    return {
        "family_name": li.family_name,
        "given_name": li.given_name,
        "middle_name": li.middle_name,
    }


def _get_professional_identity(request):
    return [
        {
            "job_title": pi.job_title,
            "role_description": pi.role_description,
            "employee_number": pi.employee_number,
        }
        for pi in request.user.professional_identities.filter(
            privacy_metadata__visibility=PrivacyMetadata.PUBLIC
        )
    ]


def _get_online_profile(request):
    return [
        {
            "username": p.username,
            "display_name": p.display_name,
        }
        for p in request.user.online_profiles.filter(
            privacy_metadata__visibility=PrivacyMetadata.PUBLIC
        )
    ]


def _get_pseudonym(request):
    return [
        p.pseudonym_value
        for p in request.user.pseudonyms.filter(
            privacy_metadata__visibility=PrivacyMetadata.PUBLIC
        )
    ]


def _get_daily_use(request):
    return [
        {
            "nickname": d.nickname,
            "preferred_name": d.preferred_name,
        }
        for d in request.user.daily_uses.filter(
            privacy_metadata__visibility=PrivacyMetadata.PUBLIC
        )
    ]


class CustomOAuth2Validator(OAuth2Validator):
    SCOPE_HANDLERS = {
        "birthdate": _get_birthdate,
        "over_18": _get_over_18,
        "place_of_birth": _get_place_of_birth,
        "address": _get_address,
        "gender": _get_gender,
        "nationality": _get_nationality,
        "credentials": _get_credentials,
        "legal_name": _get_legal_name,
        "professional_identity": _get_professional_identity,
        "online_profile": _get_online_profile,
        "pseudonym": _get_pseudonym,
        "daily_use": _get_daily_use,
    }

    def get_additional_claims(self, request):
        claims = super().get_additional_claims(request)
        return self._add_custom_claims(request, claims)

    def get_userinfo_claims(self, request):
        claims = super().get_userinfo_claims(request)
        self._add_custom_claims(request, claims)
        self._log_access(request, claims)
        return claims

    def _log_access(self, request, claims):
        from wallet.models import AccessLog

        try:
            app = getattr(request, "client", None)
            AccessLog.objects.create(
                user=request.user,
                relying_party=app.name if app else "unknown",
                application=app,
                scopes_accessed=list(request.scopes) if request.scopes else [],
                claims_returned=list(claims.keys()),
            )
        except Exception:
            logger.exception("Failed to write AccessLog entry")

    def _add_custom_claims(self, request, claims):
        for scope, handler in self.SCOPE_HANDLERS.items():
            if scope in request.scopes:
                try:
                    value = handler(request)
                    # None signals the record is private; omit the claim entirely
                    if value is not None:
                        claims[scope] = value
                except AttributeError:
                    logger.warning(
                        "User '%s' requested '%s' scope but has no associated data.",
                        request.user.email,
                        scope,
                    )

        for scope in request.scopes:
            if scope.startswith("custom_name:"):
                name_type = scope.split(":", 1)[1]
                try:
                    match = request.user.custom_objects.filter(
                        name_type=name_type,
                        privacy_metadata__visibility=PrivacyMetadata.PUBLIC,
                    ).order_by("id").first()
                    if match:
                        claims[scope] = match.name_value
                except AttributeError:
                    logger.warning(
                        "User '%s' requested '%s' scope but has no matching custom object.",
                        request.user.email,
                        scope,
                    )

        return claims
