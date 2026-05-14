from datetime import date
import logging
from oauth2_provider.oauth2_validators import OAuth2Validator

logger = logging.getLogger(__name__)


class CustomOAuth2Validator(OAuth2Validator):
    SCOPE_HANDLERS = {
        "birthdate": lambda req: str(req.user.age.birth_date),
        "over_18": lambda req: (
            date.today().year - req.user.age.birth_date.year -
            ((date.today().month, date.today().day) < (req.user.age.birth_date.month, req.user.age.birth_date.day))
        ) >= 18,
        "place_of_birth": lambda req: req.user.place_of_birth.birth_city,
        "address": lambda req: [
            {
                "address_type": address.address_type,
                "house_number": address.resident_house_number,
                "street": address.resident_street,
                "city": address.resident_city,
                "state": address.resident_state,
                "postal_code": address.resident_postal_code,
                "country": str(address.resident_country),
            }
            for address in req.user.addresses.all()
        ],
        "gender": lambda req: [
            gender.gender for gender in req.user.genders.all()
        ],
        "nationality": lambda req: [
            str(nationality.nationality)
            for nationality in req.user.nationalities.all()
        ],
        "credentials": lambda req: [
            {
                "id": credential.credential_id,
                "name": credential.credential_name,
                "type": credential.credential_type,
                "description": credential.credential_description,
                "issuing_authority": credential.issuing_authority,
                "issuance_date": str(credential.issuance_date),
                "expiry_date": str(credential.expiry_date),
                "credential_url": credential.credential_url,
            }
            for credential in req.user.credentials.all()
        ],
        "legal_name": lambda req: {
            "family_name": req.user.legal_identity.family_name,
            "given_name": req.user.legal_identity.given_name,
            "middle_name": req.user.legal_identity.middle_name,
        },
        "professional_identity": lambda req: [
            {
                "job_title": pi.job_title,
                "employer": pi.role_description,
                "employee_number": pi.employee_number,
            }
            for pi in req.user.professional_identities.all()
        ],
        "online_profile": lambda req: [
            {
                "username": profile.username,
                "display_name": profile.display_name,
            }
            for profile in req.user.online_profiles.all()
        ],
        "pseudonym": lambda req: [
            pseudonym.pseudonym_value
            for pseudonym in req.user.pseudonyms.all()
        ],
        "daily_use": lambda req: [
            {
                "nickname": daily_use.nickname,
                "preferred_name": daily_use.preferred_name,
            }
            for daily_use in req.user.daily_uses.all()
        ],
        "custom_objects": lambda req: [
            {
                "attributes": obj.attributes,
            }
            for obj in req.user.custom_objects.all()
        ],
    }

    def get_additional_claims(self, request):
        claims = super().get_additional_claims(request)
        return self._add_custom_claims(request, claims)

    def get_userinfo_claims(self, request):
        claims = super().get_userinfo_claims(request)
        return self._add_custom_claims(request, claims)

    def _add_custom_claims(self, request, claims):
        for scope, handler in self.SCOPE_HANDLERS.items():
            if scope in request.scopes:
                try:
                    claims[scope] = handler(request)
                except AttributeError:
                    logger.warning(
                        f"User '{request.user.email}' requested '{scope}' scope but has no associated data."
                    )
        return claims
