import uuid
from datetime import date

import pytest
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.utils import timezone

from wallet import models
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
    PrivacyMetadataFactory,
    ProfessionalIdentityFactory,
    PseudonymFactory,
)


# CustomUserManager


@pytest.mark.django_db
class TestCustomUserManager:
    def test_create_user_requires_email(self):
        with pytest.raises(ValueError, match="Email must be set"):
            models.CustomUser.objects.create_user(email="", password="pass")

    def test_create_user_normalizes_email(self):
        user = models.CustomUser.objects.create_user(
            email="test@EXAMPLE.COM", password="pass123"
        )
        assert user.email == "test@example.com"

    def test_create_user_sets_hashed_password(self):
        user = models.CustomUser.objects.create_user(
            email="pw@example.com", password="mysecret"
        )
        assert user.check_password("mysecret")
        assert not user.check_password("wrong")

    def test_create_superuser_sets_flags(self):
        su = models.CustomUser.objects.create_superuser(
            email="admin@example.com", password="admin123"
        )
        assert su.is_staff is True
        assert su.is_superuser is True

    def test_create_superuser_raises_if_is_staff_false(self):
        with pytest.raises(ValueError):
            models.CustomUser.objects.create_superuser(
                email="bad@example.com", password="p", is_staff=False
            )

    def test_create_superuser_raises_if_is_superuser_false(self):
        with pytest.raises(ValueError):
            models.CustomUser.objects.create_superuser(
                email="bad2@example.com", password="p", is_superuser=False
            )


# CustomUser


@pytest.mark.django_db
class TestCustomUser:
    def test_create_with_factory(self):
        user = CustomUserFactory()
        assert models.CustomUser.objects.filter(pk=user.pk).exists()

    def test_pk_is_uuid(self):
        user = CustomUserFactory()
        assert isinstance(user.pk, uuid.UUID)

    def test_str_representation(self):
        user = CustomUserFactory(email="alice@example.com")
        assert str(user) == "User: alice@example.com"

    def test_username_property_returns_email(self):
        user = CustomUserFactory(email="bob@example.com")
        assert user.username == "bob@example.com"

    def test_email_uniqueness(self):
        CustomUserFactory(email="dup@example.com")
        with pytest.raises(IntegrityError):
            CustomUserFactory(email="dup@example.com")

    def test_is_active_default_true(self):
        user = CustomUserFactory()
        assert user.is_active is True

    def test_is_staff_default_false(self):
        user = CustomUserFactory()
        assert user.is_staff is False

    def test_auto_timestamps_set(self):
        user = CustomUserFactory()
        assert user.created_at is not None
        assert user.updated_at is not None


# PrivacyMetadata


@pytest.mark.django_db
class TestPrivacyMetadata:
    def test_create_with_factory(self):
        pm = PrivacyMetadataFactory()
        assert models.PrivacyMetadata.objects.filter(pk=pm.pk).exists()

    def test_default_visibility_is_private(self):
        pm = models.PrivacyMetadata.objects.create()
        assert pm.visibility == models.PrivacyMetadata.PRIVATE

    def test_str_representation_private(self):
        pm = PrivacyMetadataFactory(visibility="private")
        assert str(pm) == "Visibility: private"

    def test_str_representation_public(self):
        pm = PrivacyMetadataFactory(visibility="public")
        assert str(pm) == "Visibility: public"

    def test_is_public_true_when_public(self):
        pm = PrivacyMetadataFactory(visibility="public")
        assert pm.is_public is True

    def test_is_public_false_when_private(self):
        pm = PrivacyMetadataFactory(visibility="private")
        assert pm.is_public is False

    def test_is_private_true_when_private(self):
        pm = PrivacyMetadataFactory(visibility="private")
        assert pm.is_private is True

    def test_is_private_false_when_public(self):
        pm = PrivacyMetadataFactory(visibility="public")
        assert pm.is_private is False

    def test_updated_at_auto_set(self):
        pm = PrivacyMetadataFactory()
        assert pm.updated_at is not None


# Age


@pytest.mark.django_db
class TestAge:
    def test_create_with_factory(self):
        age = AgeFactory()
        assert models.Age.objects.filter(pk=age.pk).exists()

    def test_str_representation(self):
        age = AgeFactory(birth_date=date(1990, 6, 15))
        assert str(age) == "Birth Date: 1990-06-15"

    def test_one_to_one_constraint(self):
        user = CustomUserFactory()
        pm = PrivacyMetadataFactory()
        AgeFactory(user=user, privacy_metadata=pm)
        with pytest.raises(IntegrityError):
            AgeFactory(user=user, privacy_metadata=PrivacyMetadataFactory())

    def test_cascade_delete_when_user_deleted(self):
        age = AgeFactory()
        age_pk = age.pk
        age.user.delete()
        assert not models.Age.objects.filter(pk=age_pk).exists()

    def test_cascade_delete_when_privacy_metadata_deleted(self):
        age = AgeFactory()
        age_pk = age.pk
        age.privacy_metadata.delete()
        assert not models.Age.objects.filter(pk=age_pk).exists()

    def test_birth_date_required(self):
        user = CustomUserFactory()
        pm = PrivacyMetadataFactory()
        with pytest.raises((IntegrityError, ValidationError)):
            models.Age.objects.create(user=user, privacy_metadata=pm, birth_date=None)


# PlaceOfBirth


@pytest.mark.django_db
class TestPlaceOfBirth:
    def test_create_with_factory(self):
        pob = PlaceOfBirthFactory()
        assert models.PlaceOfBirth.objects.filter(pk=pob.pk).exists()

    def test_str_representation(self):
        pob = PlaceOfBirthFactory(birth_city="London", birth_state="England")
        assert str(pob) == "London, England"

    def test_str_representation_when_birth_state_is_null(self):
        pob = PlaceOfBirthFactory(birth_city="Berlin", birth_state=None)
        assert str(pob) == "Berlin"

    def test_one_to_one_constraint(self):
        user = CustomUserFactory()
        PlaceOfBirthFactory(user=user)
        with pytest.raises(IntegrityError):
            PlaceOfBirthFactory(user=user)

    def test_cascade_delete_when_user_deleted(self):
        pob = PlaceOfBirthFactory()
        pob_pk = pob.pk
        pob.user.delete()
        assert not models.PlaceOfBirth.objects.filter(pk=pob_pk).exists()

    def test_birth_state_is_optional(self):
        pob = PlaceOfBirthFactory(birth_state=None)
        pob.refresh_from_db()
        assert pob.birth_state is None

    def test_birth_city_is_required(self):
        user = CustomUserFactory()
        pm = PrivacyMetadataFactory()
        pob = models.PlaceOfBirth(
            user=user,
            privacy_metadata=pm,
            birth_country="GB",
            birth_city="",
        )
        with pytest.raises(ValidationError):
            pob.full_clean()


# Address


@pytest.mark.django_db
class TestAddress:
    def test_create_with_factory(self):
        addr = AddressFactory()
        assert models.Address.objects.filter(pk=addr.pk).exists()

    def test_str_representation(self):
        addr = AddressFactory(
            address_type="home", resident_city="Rome", resident_state="Lazio"
        )
        assert str(addr) == "home - Rome, Lazio"

    def test_user_can_have_multiple_addresses(self):
        user = CustomUserFactory()
        AddressFactory(user=user)
        AddressFactory(user=user)
        assert models.Address.objects.filter(user=user).count() == 2

    def test_cascade_delete_when_user_deleted(self):
        addr = AddressFactory()
        user = addr.user
        user.delete()
        assert not models.Address.objects.filter(pk=addr.pk).exists()

    def test_cascade_delete_when_privacy_metadata_deleted(self):
        addr = AddressFactory()
        addr.privacy_metadata.delete()
        assert not models.Address.objects.filter(pk=addr.pk).exists()


# Gender


@pytest.mark.django_db
class TestGender:
    def test_create_with_factory(self):
        g = GenderFactory()
        assert models.Gender.objects.filter(pk=g.pk).exists()

    def test_str_representation(self):
        g = GenderFactory(gender="non-binary")
        assert str(g) == "non-binary"

    def test_user_can_have_multiple_gender_records(self):
        user = CustomUserFactory()
        GenderFactory(user=user)
        GenderFactory(user=user)
        assert models.Gender.objects.filter(user=user).count() == 2

    def test_cascade_delete_when_user_deleted(self):
        g = GenderFactory()
        g_pk = g.pk
        g.user.delete()
        assert not models.Gender.objects.filter(pk=g_pk).exists()


# Nationality


@pytest.mark.django_db
class TestNationality:
    def test_create_with_factory(self):
        nat = NationalityFactory()
        assert models.Nationality.objects.filter(pk=nat.pk).exists()

    def test_str_representation(self):
        nat = NationalityFactory(nationality="GB")
        assert "GB" in str(nat) or "United Kingdom" in str(nat)

    def test_user_can_have_multiple_nationalities(self):
        user = CustomUserFactory()
        NationalityFactory(user=user, nationality="GB")
        NationalityFactory(user=user, nationality="US")
        assert models.Nationality.objects.filter(user=user).count() == 2

    def test_cascade_delete_when_user_deleted(self):
        nat = NationalityFactory()
        nat_pk = nat.pk
        nat.user.delete()
        assert not models.Nationality.objects.filter(pk=nat_pk).exists()


# AccessLog


@pytest.mark.django_db
class TestAccessLog:
    def test_create_with_factory(self):
        log = AccessLogFactory()
        assert models.AccessLog.objects.filter(pk=log.pk).exists()

    def test_str_representation(self):
        log = AccessLogFactory(relying_party="Acme Corp")
        assert "Acme Corp" in str(log)
        assert "Access by" in str(log)

    def test_scopes_accessed_defaults_to_empty_list(self):
        log = AccessLogFactory()
        log.refresh_from_db()
        assert log.scopes_accessed == []

    def test_claims_returned_defaults_to_empty_list(self):
        log = AccessLogFactory()
        log.refresh_from_db()
        assert log.claims_returned == []

    def test_application_is_nullable(self):
        log = AccessLogFactory()
        assert log.application is None

    def test_access_time_auto_populated(self):
        log = AccessLogFactory()
        assert log.access_time is not None

    def test_cascade_delete_when_user_deleted(self):
        log = AccessLogFactory()
        log_pk = log.pk
        log.user.delete()
        assert not models.AccessLog.objects.filter(pk=log_pk).exists()

    def test_scopes_accessed_stores_list_of_strings(self):
        log = AccessLogFactory(scopes_accessed=["openid", "birthdate"])
        log.refresh_from_db()
        assert log.scopes_accessed == ["openid", "birthdate"]

    def test_claims_returned_stores_list_of_strings(self):
        log = AccessLogFactory(claims_returned=["sub", "birthdate"])
        log.refresh_from_db()
        assert log.claims_returned == ["sub", "birthdate"]


# Credential


@pytest.mark.django_db
class TestCredential:
    def test_create_with_factory(self):
        cred = CredentialFactory()
        assert models.Credential.objects.filter(pk=cred.pk).exists()

    def test_str_representation(self):
        user = CustomUserFactory()
        cred = CredentialFactory(user=user, issuance_date=date(2020, 1, 1))
        assert str(cred) == f"Credential for {user} issued at 2020-01-01"

    def test_expiry_date_is_optional(self):
        cred = CredentialFactory(expiry_date=None)
        cred.refresh_from_db()
        assert cred.expiry_date is None

    def test_credential_description_is_optional(self):
        cred = CredentialFactory(credential_description=None)
        cred.refresh_from_db()
        assert cred.credential_description is None

    def test_credential_url_is_optional(self):
        cred = CredentialFactory(credential_url=None)
        cred.refresh_from_db()
        assert cred.credential_url is None

    def test_user_can_have_multiple_credentials(self):
        user = CustomUserFactory()
        CredentialFactory(user=user)
        CredentialFactory(user=user)
        assert models.Credential.objects.filter(user=user).count() == 2

    def test_cascade_delete_when_user_deleted(self):
        cred = CredentialFactory()
        cred_pk = cred.pk
        cred.user.delete()
        assert not models.Credential.objects.filter(pk=cred_pk).exists()

    def test_cascade_delete_when_privacy_metadata_deleted(self):
        cred = CredentialFactory()
        cred_pk = cred.pk
        cred.privacy_metadata.delete()
        assert not models.Credential.objects.filter(pk=cred_pk).exists()


# LegalIdentity


@pytest.mark.django_db
class TestLegalIdentity:
    def test_create_with_factory(self):
        li = LegalIdentityFactory()
        assert models.LegalIdentity.objects.filter(pk=li.pk).exists()

    def test_str_representation(self):
        li = LegalIdentityFactory(given_name="Jane", family_name="Doe")
        assert str(li) == "Jane Doe"

    def test_one_to_one_constraint(self):
        user = CustomUserFactory()
        LegalIdentityFactory(user=user)
        with pytest.raises(IntegrityError):
            LegalIdentityFactory(user=user)

    def test_family_name_required(self):
        li = models.LegalIdentity(
            user=CustomUserFactory(),
            privacy_metadata=PrivacyMetadataFactory(),
            family_name="",
            given_name="Jane",
        )
        with pytest.raises(ValidationError):
            li.full_clean()

    def test_given_name_required(self):
        li = models.LegalIdentity(
            user=CustomUserFactory(),
            privacy_metadata=PrivacyMetadataFactory(),
            family_name="Doe",
            given_name="",
        )
        with pytest.raises(ValidationError):
            li.full_clean()

    def test_middle_name_optional(self):
        li = LegalIdentityFactory(middle_name=None)
        li.refresh_from_db()
        assert li.middle_name is None

    def test_family_name_birth_optional(self):
        li = LegalIdentityFactory(family_name_birth=None)
        li.refresh_from_db()
        assert li.family_name_birth is None

    def test_given_name_birth_optional(self):
        li = LegalIdentityFactory(given_name_birth=None)
        li.refresh_from_db()
        assert li.given_name_birth is None

    def test_cascade_delete_when_user_deleted(self):
        li = LegalIdentityFactory()
        li_pk = li.pk
        li.user.delete()
        assert not models.LegalIdentity.objects.filter(pk=li_pk).exists()


# ProfessionalIdentity


@pytest.mark.django_db
class TestProfessionalIdentity:
    def test_create_with_factory(self):
        pi = ProfessionalIdentityFactory()
        assert models.ProfessionalIdentity.objects.filter(pk=pi.pk).exists()

    def test_str_representation(self):
        pi = ProfessionalIdentityFactory(
            job_title="Engineer", role_description="Builds things"
        )
        assert str(pi) == "Engineer - Builds things"

    def test_user_can_have_multiple(self):
        user = CustomUserFactory()
        ProfessionalIdentityFactory(user=user)
        ProfessionalIdentityFactory(user=user)
        assert models.ProfessionalIdentity.objects.filter(user=user).count() == 2

    def test_role_description_optional(self):
        pi = ProfessionalIdentityFactory(role_description=None)
        pi.refresh_from_db()
        assert pi.role_description is None

    def test_employee_number_optional(self):
        pi = ProfessionalIdentityFactory(employee_number=None)
        pi.refresh_from_db()
        assert pi.employee_number is None

    def test_cascade_delete_when_user_deleted(self):
        pi = ProfessionalIdentityFactory()
        pi_pk = pi.pk
        pi.user.delete()
        assert not models.ProfessionalIdentity.objects.filter(pk=pi_pk).exists()


# OnlineProfile


@pytest.mark.django_db
class TestOnlineProfile:
    def test_create_with_factory(self):
        op = OnlineProfileFactory()
        assert models.OnlineProfile.objects.filter(pk=op.pk).exists()

    def test_str_representation(self):
        op = OnlineProfileFactory(platform="github", username="octocat")
        assert str(op) == "github - octocat"

    def test_user_can_have_multiple(self):
        user = CustomUserFactory()
        OnlineProfileFactory(user=user)
        OnlineProfileFactory(user=user)
        assert models.OnlineProfile.objects.filter(user=user).count() == 2

    def test_display_name_optional(self):
        op = OnlineProfileFactory(display_name=None)
        op.refresh_from_db()
        assert op.display_name is None

    def test_extra_fields_stores_json(self):
        payload = {"followers": 500, "verified": True}
        op = OnlineProfileFactory(extra_fields=payload)
        op.refresh_from_db()
        assert op.extra_fields == payload

    def test_cascade_delete_when_user_deleted(self):
        op = OnlineProfileFactory()
        op_pk = op.pk
        op.user.delete()
        assert not models.OnlineProfile.objects.filter(pk=op_pk).exists()


# Pseudonym


@pytest.mark.django_db
class TestPseudonym:
    def test_create_with_factory(self):
        ps = PseudonymFactory()
        assert models.Pseudonym.objects.filter(pk=ps.pk).exists()

    def test_str_representation(self):
        ps = PseudonymFactory(pseudonym_value="shadow_fox")
        assert str(ps) == "shadow_fox"

    def test_is_active_default_true(self):
        ps = PseudonymFactory()
        assert ps.is_active is True

    def test_user_can_have_multiple(self):
        user = CustomUserFactory()
        PseudonymFactory(user=user)
        PseudonymFactory(user=user)
        assert models.Pseudonym.objects.filter(user=user).count() == 2

    def test_cascade_delete_when_user_deleted(self):
        ps = PseudonymFactory()
        ps_pk = ps.pk
        ps.user.delete()
        assert not models.Pseudonym.objects.filter(pk=ps_pk).exists()

    def test_auto_timestamps_set(self):
        ps = PseudonymFactory()
        assert ps.created_at is not None
        assert ps.updated_at is not None


# DailyUse


@pytest.mark.django_db
class TestDailyUse:
    def test_create_with_factory(self):
        du = DailyUseFactory()
        assert models.DailyUse.objects.filter(pk=du.pk).exists()

    def test_str_returns_preferred_name_when_set(self):
        du = DailyUseFactory(preferred_name="Joey", nickname="JoeJoe")
        assert str(du) == "Joey"

    def test_str_falls_back_to_nickname(self):
        du = DailyUseFactory(preferred_name=None, nickname="JoeJoe")
        assert str(du) == "JoeJoe"

    def test_str_falls_back_to_literal_string(self):
        du = DailyUseFactory(preferred_name=None, nickname=None)
        assert str(du) == "Daily Use Identity"

    def test_preferred_name_optional(self):
        du = DailyUseFactory(preferred_name=None)
        du.refresh_from_db()
        assert du.preferred_name is None

    def test_nickname_optional(self):
        du = DailyUseFactory(nickname=None)
        du.refresh_from_db()
        assert du.nickname is None

    def test_user_can_have_multiple(self):
        user = CustomUserFactory()
        DailyUseFactory(user=user)
        DailyUseFactory(user=user)
        assert models.DailyUse.objects.filter(user=user).count() == 2

    def test_cascade_delete_when_user_deleted(self):
        du = DailyUseFactory()
        du_pk = du.pk
        du.user.delete()
        assert not models.DailyUse.objects.filter(pk=du_pk).exists()


# CustomObject


@pytest.mark.django_db
class TestCustomObject:
    def test_create_with_factory(self):
        co = CustomObjectFactory()
        assert models.CustomObject.objects.filter(pk=co.pk).exists()

    def test_str_representation(self):
        user = CustomUserFactory()
        co = CustomObjectFactory(user=user, name_type="employee_id")
        assert "employee_id" in str(co)
        assert str(user) in str(co)

    def test_name_type_validator_accepts_letters_digits_underscores(self):
        co = CustomObjectFactory(name_type="valid_123")
        co.full_clean()

    def test_name_type_validator_rejects_spaces(self):
        co = CustomObjectFactory.build(name_type="has space")
        with pytest.raises(ValidationError):
            co.full_clean()

    def test_name_type_validator_rejects_hyphens(self):
        co = CustomObjectFactory.build(name_type="has-hyphen")
        with pytest.raises(ValidationError):
            co.full_clean()

    def test_name_type_validator_rejects_special_chars(self):
        co = CustomObjectFactory.build(name_type="bad@char!")
        with pytest.raises(ValidationError):
            co.full_clean()

    def test_user_can_have_multiple(self):
        user = CustomUserFactory()
        CustomObjectFactory(user=user, name_type="employee_id")
        CustomObjectFactory(user=user, name_type="membership_id")
        assert models.CustomObject.objects.filter(user=user).count() == 2

    def test_cascade_delete_when_user_deleted(self):
        co = CustomObjectFactory()
        co_pk = co.pk
        co.user.delete()
        assert not models.CustomObject.objects.filter(pk=co_pk).exists()


# NameHistory


@pytest.mark.django_db
class TestNameHistory:
    def test_create_with_factory(self):
        nh = NameHistoryFactory()
        assert models.NameHistory.objects.filter(pk=nh.pk).exists()

    def test_str_representation(self):
        nh = NameHistoryFactory(given_name="Alice", family_name="Smith")
        result = str(nh)
        assert "Alice" in result
        assert "Smith" in result
        assert "Name changed from" in result

    def test_middle_name_optional(self):
        nh = NameHistoryFactory(middle_name=None)
        nh.refresh_from_db()
        assert nh.middle_name is None

    def test_user_can_have_multiple(self):
        user = CustomUserFactory()
        NameHistoryFactory(user=user)
        NameHistoryFactory(user=user)
        assert models.NameHistory.objects.filter(user=user).count() == 2

    def test_cascade_delete_when_user_deleted(self):
        nh = NameHistoryFactory()
        nh_pk = nh.pk
        nh.user.delete()
        assert not models.NameHistory.objects.filter(pk=nh_pk).exists()

    def test_valid_from_and_valid_until_are_datetimes(self):
        now = timezone.now()
        nh = NameHistoryFactory(
            valid_from=now - timezone.timedelta(days=365),
            valid_until=now,
        )
        nh.refresh_from_db()
        assert nh.valid_from is not None
        assert nh.valid_until is not None
        assert nh.valid_until > nh.valid_from
