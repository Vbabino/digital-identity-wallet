from types import SimpleNamespace

import pytest

from wallet.factories import (
    AddressFactory,
    CustomObjectFactory,
    CustomUserFactory,
    DailyUseFactory,
    PrivacyMetadataFactory,
)
from wallet.models import AccessLog, PrivacyMetadata
from wallet.oauth_validators import CustomOAuth2Validator


def make_request(user, scopes, client=None):
    return SimpleNamespace(user=user, scopes=scopes, client=client)


@pytest.fixture
def validator():
    return CustomOAuth2Validator()


@pytest.mark.django_db
class TestAddCustomClaimsMultiRecordScopes:
    """A private (or absent) record must never surface its scope key at all,
    since an empty-list claim in the response is indistinguishable from a
    disclosed-but-empty assertion once it lands in AccessLog.claims_returned."""

    def test_private_daily_use_omits_claim_entirely(self, validator):
        user = CustomUserFactory()
        DailyUseFactory(
            user=user, privacy_metadata=PrivacyMetadataFactory(visibility=PrivacyMetadata.PRIVATE)
        )
        request = make_request(user, ["daily_use"])

        claims = validator._add_custom_claims(request, {})

        assert "daily_use" not in claims

    def test_public_daily_use_included_in_claims(self, validator):
        user = CustomUserFactory()
        DailyUseFactory(
            user=user, privacy_metadata=PrivacyMetadataFactory(visibility=PrivacyMetadata.PUBLIC)
        )
        request = make_request(user, ["daily_use"])

        claims = validator._add_custom_claims(request, {})

        assert "daily_use" in claims
        assert len(claims["daily_use"]) == 1

    def test_no_daily_use_records_omits_claim(self, validator):
        user = CustomUserFactory()
        request = make_request(user, ["daily_use"])

        claims = validator._add_custom_claims(request, {})

        assert "daily_use" not in claims

    def test_private_address_omits_claim_entirely(self, validator):
        user = CustomUserFactory()
        AddressFactory(
            user=user, privacy_metadata=PrivacyMetadataFactory(visibility=PrivacyMetadata.PRIVATE)
        )
        request = make_request(user, ["address"])

        claims = validator._add_custom_claims(request, {})

        assert "address" not in claims

    def test_private_custom_name_scope_omits_claim(self, validator):
        user = CustomUserFactory()
        CustomObjectFactory(
            user=user,
            name_type="employee_id",
            privacy_metadata=PrivacyMetadataFactory(visibility=PrivacyMetadata.PRIVATE),
        )
        request = make_request(user, ["custom_name:employee_id"])

        claims = validator._add_custom_claims(request, {})

        assert "custom_name:employee_id" not in claims


@pytest.mark.django_db
class TestLogAccessMatchesDisclosedClaims:
    def test_access_log_does_not_record_private_daily_use_scope(self, validator):
        user = CustomUserFactory()
        DailyUseFactory(
            user=user, privacy_metadata=PrivacyMetadataFactory(visibility=PrivacyMetadata.PRIVATE)
        )
        request = make_request(user, ["daily_use"])
        claims = validator._add_custom_claims(request, {})

        validator._log_access(request, claims)

        log = AccessLog.objects.get(user=user)
        assert "daily_use" not in log.claims_returned
