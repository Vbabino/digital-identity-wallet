from datetime import date, timedelta

import pytest
from django.utils import timezone

from wallet.factories import (
    AccessLogFactory,
    AddressFactory,
    AgeFactory,
    CredentialFactory,
    CustomObjectFactory,
    CustomUserFactory,
    DailyUseFactory,
    GenderFactory,
    LegalIdentityFactory,
    NameHistoryFactory,
    NationalityFactory,
    OnlineProfileFactory,
    PlaceOfBirthFactory,
    ProfessionalIdentityFactory,
    PseudonymFactory,
)
from wallet.models import PrivacyMetadata
from wallet.serializers import (
    AccessLogSerializer,
    AddressSerializer,
    CredentialSerializer,
    CustomObjectSerializer,
    DailyUseSerializer,
    DateOfBirthSerializer,
    GenderSerializer,
    LegalIdentitySerializer,
    NameHistorySerializer,
    NationalitySerializer,
    OnlineProfileSerializer,
    PlaceOfBirthSerializer,
    ProfessionalIdentitySerializer,
    PseudonymSerializer,
)


# PrivacyMetadataMixin — tested via DateOfBirthSerializer as proxy


@pytest.mark.django_db
class TestPrivacyMetadataMixin:
    def test_create_creates_privacy_metadata_record(self):
        user = CustomUserFactory()
        s = DateOfBirthSerializer(
            data={"birth_date": "1990-06-15", "visibility": "public"}
        )
        assert s.is_valid(), s.errors
        instance = s.save(user=user)

        assert PrivacyMetadata.objects.count() == 1
        assert instance.privacy_metadata.visibility == "public"

    def test_create_with_explicit_private_visibility(self):
        user = CustomUserFactory()
        s = DateOfBirthSerializer(
            data={"birth_date": "1990-06-15", "visibility": "private"}
        )
        assert s.is_valid(), s.errors
        instance = s.save(user=user)
        assert instance.privacy_metadata.visibility == "private"

    def test_create_falls_back_to_private_when_visibility_omitted(self):
        user = CustomUserFactory()
        # With partial=True, omitting visibility means privacy_metadata is absent from
        # validated_data, so the mixin's get("visibility", PrivacyMetadata.PRIVATE) default fires.
        s = DateOfBirthSerializer(data={"birth_date": "1992-03-01"}, partial=True)
        assert s.is_valid(), s.errors
        instance = s.save(user=user)
        assert instance.privacy_metadata.visibility == PrivacyMetadata.PRIVATE

    def test_visibility_included_in_serialized_output(self):
        age = AgeFactory()
        data = DateOfBirthSerializer(age).data
        assert "visibility" in data
        assert data["visibility"] in ("public", "private")

    def test_update_changes_visibility(self):
        age = AgeFactory()
        age.privacy_metadata.visibility = "private"
        age.privacy_metadata.save()

        s = DateOfBirthSerializer(
            age,
            data={"birth_date": str(age.birth_date), "visibility": "public"},
        )
        assert s.is_valid(), s.errors
        s.save()

        age.privacy_metadata.refresh_from_db()
        assert age.privacy_metadata.visibility == "public"

    def test_partial_update_without_visibility_leaves_privacy_unchanged(self):
        age = AgeFactory()
        age.privacy_metadata.visibility = "public"
        age.privacy_metadata.save()

        s = DateOfBirthSerializer(age, data={"birth_date": "1991-01-01"}, partial=True)
        assert s.is_valid(), s.errors
        s.save()

        age.privacy_metadata.refresh_from_db()
        assert age.privacy_metadata.visibility == "public"

    def test_visibility_invalid_choice_rejected(self):
        s = DateOfBirthSerializer(
            data={"birth_date": "1990-06-15", "visibility": "secret"}
        )
        assert not s.is_valid()
        assert "visibility" in s.errors

    def test_user_field_is_read_only(self):
        other_user = CustomUserFactory()
        s = DateOfBirthSerializer(
            data={
                "birth_date": "1990-06-15",
                "visibility": "private",
                "user": str(other_user.pk),
            }
        )
        assert s.is_valid(), s.errors
        # user must be supplied via save(), not taken from input data
        real_user = CustomUserFactory()
        instance = s.save(user=real_user)
        assert instance.user == real_user


# DateOfBirthSerializer


@pytest.mark.django_db
class TestDateOfBirthSerializer:
    def test_serializes_expected_fields(self):
        age = AgeFactory(birth_date=date(1985, 3, 20))
        data = DateOfBirthSerializer(age).data
        assert set(data.keys()) == {"user", "birth_date", "visibility"}
        assert data["birth_date"] == "1985-03-20"

    def test_deserialize_valid_data(self):
        user = CustomUserFactory()
        s = DateOfBirthSerializer(
            data={"birth_date": "2000-01-01", "visibility": "private"}
        )
        assert s.is_valid(), s.errors
        instance = s.save(user=user)
        instance.refresh_from_db()
        assert instance.birth_date == date(2000, 1, 1)

    def test_birth_date_required(self):
        s = DateOfBirthSerializer(data={"visibility": "private"})
        assert not s.is_valid()
        assert "birth_date" in s.errors

    def test_visibility_required(self):
        s = DateOfBirthSerializer(data={"birth_date": "1990-01-01"})
        assert not s.is_valid()
        assert "visibility" in s.errors


# PlaceOfBirthSerializer


@pytest.mark.django_db
class TestPlaceOfBirthSerializer:
    def test_serializes_expected_fields(self):
        pob = PlaceOfBirthFactory(
            birth_city="Rome", birth_state="Lazio", birth_country="IT"
        )
        data = PlaceOfBirthSerializer(pob).data
        assert set(data.keys()) == {
            "user",
            "birth_city",
            "birth_state",
            "birth_country",
            "visibility",
        }
        assert data["birth_city"] == "Rome"

    def test_deserialize_valid_data(self):
        user = CustomUserFactory()
        s = PlaceOfBirthSerializer(
            data={
                "birth_city": "London",
                "birth_state": "England",
                "birth_country": "GB",
                "visibility": "private",
            }
        )
        assert s.is_valid(), s.errors
        instance = s.save(user=user)
        instance.refresh_from_db()
        assert instance.birth_city == "London"

    def test_birth_state_is_optional(self):
        user = CustomUserFactory()
        s = PlaceOfBirthSerializer(
            data={
                "birth_city": "Berlin",
                "birth_country": "DE",
                "visibility": "public",
            }
        )
        assert s.is_valid(), s.errors
        instance = s.save(user=user)
        assert instance.birth_state is None or instance.birth_state == ""

    def test_birth_city_required(self):
        s = PlaceOfBirthSerializer(
            data={
                "birth_country": "GB",
                "visibility": "private",
            }
        )
        assert not s.is_valid()
        assert "birth_city" in s.errors

    def test_birth_country_required(self):
        s = PlaceOfBirthSerializer(
            data={
                "birth_city": "London",
                "visibility": "private",
            }
        )
        assert not s.is_valid()
        assert "birth_country" in s.errors


# LegalIdentitySerializer


@pytest.mark.django_db
class TestLegalIdentitySerializer:
    def test_serializes_expected_fields(self):
        li = LegalIdentityFactory(given_name="Jane", family_name="Doe")
        data = LegalIdentitySerializer(li).data
        expected = {
            "user",
            "family_name",
            "middle_name",
            "given_name",
            "family_name_birth",
            "given_name_birth",
            "visibility",
        }
        assert set(data.keys()) == expected
        assert data["given_name"] == "Jane"
        assert data["family_name"] == "Doe"

    def test_deserialize_valid_data(self):
        user = CustomUserFactory()
        s = LegalIdentitySerializer(
            data={
                "family_name": "Smith",
                "given_name": "Alice",
                "visibility": "private",
            }
        )
        assert s.is_valid(), s.errors
        instance = s.save(user=user)
        assert instance.family_name == "Smith"

    def test_family_name_required(self):
        s = LegalIdentitySerializer(
            data={"given_name": "Alice", "visibility": "private"}
        )
        assert not s.is_valid()
        assert "family_name" in s.errors

    def test_given_name_required(self):
        s = LegalIdentitySerializer(
            data={"family_name": "Smith", "visibility": "private"}
        )
        assert not s.is_valid()
        assert "given_name" in s.errors

    def test_optional_name_fields(self):
        user = CustomUserFactory()
        s = LegalIdentitySerializer(
            data={
                "family_name": "Smith",
                "given_name": "Alice",
                "middle_name": "Marie",
                "family_name_birth": "Jones",
                "given_name_birth": "Ali",
                "visibility": "public",
            }
        )
        assert s.is_valid(), s.errors
        instance = s.save(user=user)
        assert instance.middle_name == "Marie"


# AddressSerializer


@pytest.mark.django_db
class TestAddressSerializer:
    _REQUIRED_FIELDS = {
        "address_type": "home",
        "resident_country": "GB",
        "resident_state": "England",
        "resident_city": "London",
        "resident_postal_code": "SW1A 1AA",
        "resident_street": "Downing Street",
        "resident_house_number": "10",
        "visibility": "private",
    }

    def test_serializes_expected_fields(self):
        addr = AddressFactory()
        data = AddressSerializer(addr).data
        expected = {
            "user",
            "address_type",
            "resident_country",
            "resident_state",
            "resident_city",
            "resident_postal_code",
            "resident_street",
            "resident_house_number",
            "visibility",
        }
        assert set(data.keys()) == expected

    def test_deserialize_valid_data(self):
        user = CustomUserFactory()
        s = AddressSerializer(data=self._REQUIRED_FIELDS)
        assert s.is_valid(), s.errors
        instance = s.save(user=user)
        assert instance.resident_city == "London"

    def test_missing_required_field_rejected(self):
        payload = dict(self._REQUIRED_FIELDS)
        del payload["resident_city"]
        s = AddressSerializer(data=payload)
        assert not s.is_valid()
        assert "resident_city" in s.errors


# GenderSerializer


@pytest.mark.django_db
class TestGenderSerializer:
    def test_serializes_expected_fields(self):
        g = GenderFactory(gender="female")
        data = GenderSerializer(g).data
        assert set(data.keys()) == {"user", "gender", "visibility"}
        assert data["gender"] == "female"

    def test_deserialize_valid_data(self):
        user = CustomUserFactory()
        s = GenderSerializer(data={"gender": "non-binary", "visibility": "private"})
        assert s.is_valid(), s.errors
        instance = s.save(user=user)
        assert instance.gender == "non-binary"

    def test_gender_required(self):
        s = GenderSerializer(data={"visibility": "private"})
        assert not s.is_valid()
        assert "gender" in s.errors


# NationalitySerializer


@pytest.mark.django_db
class TestNationalitySerializer:
    def test_serializes_expected_fields(self):
        nat = NationalityFactory(nationality="IT")
        data = NationalitySerializer(nat).data
        assert set(data.keys()) == {"user", "nationality", "visibility"}

    def test_deserialize_valid_data(self):
        user = CustomUserFactory()
        s = NationalitySerializer(data={"nationality": "DE", "visibility": "public"})
        assert s.is_valid(), s.errors
        instance = s.save(user=user)
        assert str(instance.nationality) == "DE"

    def test_invalid_country_code_rejected(self):
        s = NationalitySerializer(data={"nationality": "XX", "visibility": "private"})
        assert not s.is_valid()
        assert "nationality" in s.errors


# CredentialSerializer — field tests


@pytest.mark.django_db
class TestCredentialSerializer:
    _BASE = {
        "credential_id": "CRED-001",
        "credential_type": "government",
        "credential_name": "Passport",
        "issuing_authority": "HMPO",
        "issuance_date": "2020-01-01",
        "visibility": "private",
    }

    def test_serializes_expected_fields(self):
        cred = CredentialFactory()
        data = CredentialSerializer(cred).data
        expected = {
            "user",
            "credential_id",
            "credential_type",
            "credential_name",
            "credential_description",
            "issuing_authority",
            "issuance_date",
            "expiry_date",
            "credential_url",
            "visibility",
        }
        assert set(data.keys()) == expected

    def test_deserialize_valid_data(self):
        user = CustomUserFactory()
        s = CredentialSerializer(data=self._BASE)
        assert s.is_valid(), s.errors
        instance = s.save(user=user)
        assert instance.credential_name == "Passport"

    def test_expiry_date_optional(self):
        user = CustomUserFactory()
        payload = {**self._BASE, "expiry_date": None}
        s = CredentialSerializer(data=payload)
        assert s.is_valid(), s.errors
        instance = s.save(user=user)
        assert instance.expiry_date is None

    def test_credential_description_optional(self):
        user = CustomUserFactory()
        s = CredentialSerializer(data=self._BASE)
        assert s.is_valid(), s.errors
        instance = s.save(user=user)
        assert instance.credential_description is None

    def test_credential_url_optional(self):
        user = CustomUserFactory()
        s = CredentialSerializer(data=self._BASE)
        assert s.is_valid(), s.errors
        instance = s.save(user=user)
        assert instance.credential_url is None

    def test_required_fields_enforced(self):
        s = CredentialSerializer(data={"visibility": "private"})
        assert not s.is_valid()
        for field in (
            "credential_id",
            "credential_type",
            "credential_name",
            "issuing_authority",
            "issuance_date",
        ):
            assert field in s.errors


# CredentialSerializer — validate_credential_url


class TestCredentialUrlValidator:
    """Unit tests for validate_credential_url — no DB needed."""

    _BASE = {
        "credential_id": "CRED-001",
        "credential_type": "government",
        "credential_name": "Passport",
        "issuing_authority": "HMPO",
        "issuance_date": "2020-01-01",
        "visibility": "private",
    }

    def _s(self, url):
        return CredentialSerializer(data={**self._BASE, "credential_url": url})

    def test_none_url_accepted(self):
        assert self._s(None).is_valid()

    def test_empty_string_accepted(self):
        assert self._s("").is_valid()

    def test_valid_https_url_accepted(self):
        assert self._s("https://example.com/credential").is_valid()

    def test_http_url_rejected(self):
        s = self._s("http://example.com/credential")
        assert not s.is_valid()
        assert "credential_url" in s.errors

    def test_ftp_url_rejected(self):
        s = self._s("ftp://example.com/credential")
        assert not s.is_valid()
        assert "credential_url" in s.errors

    def test_no_netloc_rejected(self):
        # DRF's URLField validator intercepts 'https://' before the custom method runs,
        # so test the branch directly on the serializer instance.
        from rest_framework.exceptions import ValidationError as DRFValidationError

        s = CredentialSerializer()
        with pytest.raises(DRFValidationError, match="valid host"):
            s.validate_credential_url("https://")

    def test_localhost_rejected(self):
        s = self._s("https://localhost/credential")
        assert not s.is_valid()
        assert "credential_url" in s.errors

    def test_localhost_uppercase_rejected(self):
        s = self._s("https://LOCALHOST/credential")
        assert not s.is_valid()
        assert "credential_url" in s.errors

    def test_loopback_ipv4_rejected(self):
        s = self._s("https://127.0.0.1/credential")
        assert not s.is_valid()
        assert "credential_url" in s.errors

    def test_loopback_ipv6_rejected(self):
        s = self._s("https://[::1]/credential")
        assert not s.is_valid()
        assert "credential_url" in s.errors

    def test_private_ip_10_rejected(self):
        s = self._s("https://10.0.0.1/credential")
        assert not s.is_valid()
        assert "credential_url" in s.errors

    def test_private_ip_172_rejected(self):
        s = self._s("https://172.16.0.1/credential")
        assert not s.is_valid()
        assert "credential_url" in s.errors

    def test_private_ip_192_168_rejected(self):
        s = self._s("https://192.168.1.1/credential")
        assert not s.is_valid()
        assert "credential_url" in s.errors


# ProfessionalIdentitySerializer


@pytest.mark.django_db
class TestProfessionalIdentitySerializer:
    def test_serializes_expected_fields(self):
        pi = ProfessionalIdentityFactory(job_title="Engineer")
        data = ProfessionalIdentitySerializer(pi).data
        expected = {
            "user",
            "job_title",
            "role_description",
            "employee_number",
            "visibility",
        }
        assert set(data.keys()) == expected
        assert data["job_title"] == "Engineer"

    def test_deserialize_valid_data(self):
        user = CustomUserFactory()
        s = ProfessionalIdentitySerializer(
            data={"job_title": "Developer", "visibility": "private"}
        )
        assert s.is_valid(), s.errors
        instance = s.save(user=user)
        assert instance.job_title == "Developer"

    def test_job_title_required(self):
        s = ProfessionalIdentitySerializer(data={"visibility": "private"})
        assert not s.is_valid()
        assert "job_title" in s.errors

    def test_optional_fields(self):
        user = CustomUserFactory()
        s = ProfessionalIdentitySerializer(
            data={
                "job_title": "Manager",
                "role_description": "Manages teams",
                "employee_number": "EMP-001",
                "visibility": "public",
            }
        )
        assert s.is_valid(), s.errors
        instance = s.save(user=user)
        assert instance.role_description == "Manages teams"
        assert instance.employee_number == "EMP-001"


# OnlineProfileSerializer


@pytest.mark.django_db
class TestOnlineProfileSerializer:
    def test_serializes_expected_fields(self):
        op = OnlineProfileFactory(platform="github", username="octocat")
        data = OnlineProfileSerializer(op).data
        assert set(data.keys()) == {
            "user",
            "platform",
            "username",
            "display_name",
            "visibility",
        }
        assert data["platform"] == "github"
        assert data["username"] == "octocat"

    def test_deserialize_valid_data(self):
        user = CustomUserFactory()
        s = OnlineProfileSerializer(
            data={"platform": "linkedin", "username": "alice", "visibility": "public"}
        )
        assert s.is_valid(), s.errors
        instance = s.save(user=user)
        assert instance.platform == "linkedin"

    def test_platform_required(self):
        s = OnlineProfileSerializer(data={"username": "alice", "visibility": "public"})
        assert not s.is_valid()
        assert "platform" in s.errors

    def test_username_required(self):
        s = OnlineProfileSerializer(
            data={"platform": "linkedin", "visibility": "public"}
        )
        assert not s.is_valid()
        assert "username" in s.errors

    def test_display_name_optional(self):
        user = CustomUserFactory()
        s = OnlineProfileSerializer(
            data={"platform": "x", "username": "alice123", "visibility": "private"}
        )
        assert s.is_valid(), s.errors
        instance = s.save(user=user)
        assert instance.display_name is None or instance.display_name == ""


# PseudonymSerializer


@pytest.mark.django_db
class TestPseudonymSerializer:
    def test_serializes_expected_fields(self):
        ps = PseudonymFactory(pseudonym_value="ghost_42")
        data = PseudonymSerializer(ps).data
        assert set(data.keys()) == {
            "user",
            "relying_party",
            "pseudonym_value",
            "is_active",
            "visibility",
        }
        assert data["pseudonym_value"] == "ghost_42"

    def test_deserialize_valid_data(self):
        user = CustomUserFactory()
        s = PseudonymSerializer(
            data={
                "relying_party": "Acme Inc",
                "pseudonym_value": "shadow_99",
                "is_active": True,
                "visibility": "private",
            }
        )
        assert s.is_valid(), s.errors
        instance = s.save(user=user)
        assert instance.pseudonym_value == "shadow_99"

    def test_is_active_defaults_to_true_on_model(self):
        user = CustomUserFactory()
        s = PseudonymSerializer(
            data={
                "relying_party": "Corp",
                "pseudonym_value": "anon",
                "visibility": "private",
            }
        )
        assert s.is_valid(), s.errors
        instance = s.save(user=user)
        assert instance.is_active is True


# DailyUseSerializer


@pytest.mark.django_db
class TestDailyUseSerializer:
    def test_serializes_expected_fields(self):
        du = DailyUseFactory(preferred_name="Joey", nickname="Joe")
        data = DailyUseSerializer(du).data
        assert set(data.keys()) == {"user", "preferred_name", "nickname", "visibility"}
        assert data["preferred_name"] == "Joey"

    def test_deserialize_valid_minimal_data(self):
        user = CustomUserFactory()
        s = DailyUseSerializer(data={"visibility": "public"})
        assert s.is_valid(), s.errors
        instance = s.save(user=user)
        assert instance.preferred_name is None
        assert instance.nickname is None

    def test_preferred_name_and_nickname_optional(self):
        user = CustomUserFactory()
        s = DailyUseSerializer(
            data={
                "preferred_name": "Charlie",
                "nickname": "Chuck",
                "visibility": "private",
            }
        )
        assert s.is_valid(), s.errors
        instance = s.save(user=user)
        assert instance.preferred_name == "Charlie"
        assert instance.nickname == "Chuck"


# CustomObjectSerializer


@pytest.mark.django_db
class TestCustomObjectSerializer:
    def test_serializes_expected_fields(self):
        co = CustomObjectFactory(name_type="employee_id", name_value="EMP-001")
        data = CustomObjectSerializer(co).data
        assert set(data.keys()) == {"user", "name_type", "name_value", "visibility"}
        assert data["name_type"] == "employee_id"

    def test_deserialize_valid_data(self):
        user = CustomUserFactory()
        s = CustomObjectSerializer(
            data={
                "name_type": "student_number",
                "name_value": "STU-12345",
                "visibility": "private",
            }
        )
        assert s.is_valid(), s.errors
        instance = s.save(user=user)
        assert instance.name_type == "student_number"

    def test_name_type_required(self):
        s = CustomObjectSerializer(data={"name_value": "123", "visibility": "private"})
        assert not s.is_valid()
        assert "name_type" in s.errors

    def test_name_value_required(self):
        s = CustomObjectSerializer(
            data={"name_type": "employee_id", "visibility": "private"}
        )
        assert not s.is_valid()
        assert "name_value" in s.errors

    def test_name_type_invalid_characters_rejected(self):
        for bad in ("has space", "has-hyphen", "bad@char"):
            s = CustomObjectSerializer(
                data={
                    "name_type": bad,
                    "name_value": "VAL-001",
                    "visibility": "private",
                }
            )
            assert not s.is_valid(), f"Expected invalid for name_type={bad!r}"
            assert "name_type" in s.errors


# NameHistorySerializer


@pytest.mark.django_db
class TestNameHistorySerializer:
    def test_serializes_expected_fields(self):
        nh = NameHistoryFactory(given_name="Alice", family_name="Smith")
        data = NameHistorySerializer(nh).data
        expected = {
            "user",
            "family_name",
            "middle_name",
            "given_name",
            "valid_from",
            "valid_until",
            "visibility",
        }
        assert set(data.keys()) == expected
        assert data["given_name"] == "Alice"

    def test_deserialize_valid_data(self):
        user = CustomUserFactory()
        now = timezone.now()
        s = NameHistorySerializer(
            data={
                "family_name": "Jones",
                "given_name": "Bob",
                "valid_from": (now - timedelta(days=365)).isoformat(),
                "valid_until": now.isoformat(),
                "visibility": "private",
            }
        )
        assert s.is_valid(), s.errors
        instance = s.save(user=user)
        assert instance.family_name == "Jones"

    def test_required_fields(self):
        s = NameHistorySerializer(data={"visibility": "private"})
        assert not s.is_valid()
        for field in ("family_name", "given_name", "valid_from", "valid_until"):
            assert field in s.errors

    def test_middle_name_optional(self):
        user = CustomUserFactory()
        now = timezone.now()
        s = NameHistorySerializer(
            data={
                "family_name": "Jones",
                "given_name": "Bob",
                "valid_from": (now - timedelta(days=365)).isoformat(),
                "valid_until": now.isoformat(),
                "visibility": "private",
            }
        )
        assert s.is_valid(), s.errors
        instance = s.save(user=user)
        assert instance.middle_name is None


# AccessLogSerializer


@pytest.mark.django_db
class TestAccessLogSerializer:
    def test_serializes_expected_fields(self):
        log = AccessLogFactory(relying_party="Acme", scopes_accessed=["openid"])
        data = AccessLogSerializer(log).data
        assert set(data.keys()) == {
            "user",
            "relying_party",
            "application",
            "scopes_accessed",
            "claims_returned",
            "access_time",
        }

    def test_scopes_accessed_serialized(self):
        log = AccessLogFactory(scopes_accessed=["openid", "birthdate"])
        data = AccessLogSerializer(log).data
        assert data["scopes_accessed"] == ["openid", "birthdate"]

    def test_claims_returned_serialized(self):
        log = AccessLogFactory(claims_returned=["sub", "birthdate"])
        data = AccessLogSerializer(log).data
        assert data["claims_returned"] == ["sub", "birthdate"]

    def test_application_serialized_as_none_when_not_set(self):
        log = AccessLogFactory()
        data = AccessLogSerializer(log).data
        assert data["application"] is None

    def test_all_fields_are_read_only(self):
        log = AccessLogFactory()
        # Attempting to write any field should not change the instance
        s = AccessLogSerializer(
            log,
            data={
                "relying_party": "HACKED",
                "scopes_accessed": ["all"],
                "claims_returned": ["everything"],
            },
            partial=True,
        )
        # is_valid() may or may not pass (all fields are read_only so input is ignored)
        s.is_valid()
        # The serializer declares all fields as read_only — no writable fields to update
        assert s.validated_data == {}

    def test_serializes_multiple_logs(self):
        user = CustomUserFactory()
        AccessLogFactory(user=user)
        AccessLogFactory(user=user)
        from wallet.models import AccessLog

        logs = AccessLog.objects.filter(user=user)
        data = AccessLogSerializer(logs, many=True).data
        assert len(data) == 2
