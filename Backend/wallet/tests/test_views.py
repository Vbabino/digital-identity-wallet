import json
from datetime import timedelta
from unittest.mock import patch

import pytest
from django.utils import timezone
from rest_framework import status

from wallet.export_service import WalletExportError
from wallet.factories import (
    AccessLogFactory,
    AddressFactory,
    AgeFactory,
    CredentialFactory,
    CustomObjectFactory,
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
from wallet.models import (
    Address,
    Age,
    Credential,
    CustomObject,
    DailyUse,
    Gender,
    LegalIdentity,
    NameHistory,
    Nationality,
    OnlineProfile,
    PlaceOfBirth,
    ProfessionalIdentity,
    Pseudonym,
)


# Helpers


_DOB_URL = "/api/wallet/date-of-birth/"
_POB_URL = "/api/wallet/place-of-birth/"
_LEGAL_URL = "/api/wallet/legal-identities/"
_ADDRESSES_URL = "/api/wallet/addresses/"
_GENDER_URL = "/api/wallet/gender/"
_NATIONALITY_URL = "/api/wallet/nationalities/"
_CREDENTIALS_URL = "/api/wallet/credentials/"
_PROFESSIONALS_URL = "/api/wallet/professionals/"
_ONLINE_PROFILES_URL = "/api/wallet/online-profiles/"
_PSEUDONYMS_URL = "/api/wallet/pseudonyms/"
_DAILY_USES_URL = "/api/wallet/daily-uses/"
_CUSTOM_OBJECTS_URL = "/api/wallet/custom-objects/"
_NAME_HISTORIES_URL = "/api/wallet/name-histories/"
_ACCESS_LOGS_URL = "/api/wallet/access-logs/"
_EXPORT_URL = "/api/wallet/export/"

_ADDRESS_PAYLOAD = {
    "address_type": "home",
    "resident_country": "GB",
    "resident_state": "England",
    "resident_city": "London",
    "resident_postal_code": "SW1A 1AA",
    "resident_street": "Downing Street",
    "resident_house_number": "10",
    "visibility": "private",
}

_NOW = timezone.now()
_NAME_HISTORY_PAYLOAD = {
    "family_name": "Smith",
    "given_name": "Alice",
    "valid_from": (_NOW - timedelta(days=365)).isoformat(),
    "valid_until": _NOW.isoformat(),
    "visibility": "private",
}


# UserSingletonAPIView — tested via DateOfBirthView


@pytest.mark.django_db
class TestUserSingletonAPIView:
    # --- authentication ---

    def test_get_unauthenticated_returns_401(self, api_client):
        response = api_client.get(_DOB_URL)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_post_unauthenticated_returns_401(self, api_client):
        response = api_client.post(
            _DOB_URL, {"birth_date": "1990-01-01", "visibility": "private"}
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_put_unauthenticated_returns_401(self, api_client):
        response = api_client.put(
            _DOB_URL, {"birth_date": "1990-01-01", "visibility": "private"}
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_patch_unauthenticated_returns_401(self, api_client):
        response = api_client.patch(_DOB_URL, {"birth_date": "1990-01-01"})
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    # --- GET ---

    def test_get_returns_404_when_no_record(self, auth_client):
        response = auth_client.get(_DOB_URL)
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert "not found" in response.data["detail"].lower()

    def test_get_returns_200_with_record(self, auth_client):
        AgeFactory(user=auth_client.user)
        response = auth_client.get(_DOB_URL)
        assert response.status_code == status.HTTP_200_OK
        assert "birth_date" in response.data

    def test_get_does_not_return_other_users_record(self, auth_client):
        AgeFactory()  # different user
        response = auth_client.get(_DOB_URL)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    # --- POST ---

    def test_post_creates_record_and_returns_201(self, auth_client):
        response = auth_client.post(
            _DOB_URL,
            {"birth_date": "1990-06-15", "visibility": "private"},
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["birth_date"] == "1990-06-15"
        assert Age.objects.filter(user=auth_client.user).exists()

    def test_post_returns_400_when_record_already_exists(self, auth_client):
        AgeFactory(user=auth_client.user)
        response = auth_client.post(
            _DOB_URL,
            {"birth_date": "1990-06-15", "visibility": "private"},
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "already exists" in response.data["detail"]

    def test_post_invalid_data_returns_400(self, auth_client):
        response = auth_client.post(
            _DOB_URL, {"birth_date": "not-a-date", "visibility": "private"}
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "birth_date" in response.data

    def test_post_assigns_record_to_authenticated_user(self, auth_client):
        auth_client.post(
            _DOB_URL,
            {"birth_date": "1985-03-20", "visibility": "public"},
        )
        age = Age.objects.get(user=auth_client.user)
        assert str(age.birth_date) == "1985-03-20"

    # --- PUT ---

    def test_put_updates_record_and_returns_200(self, auth_client):
        AgeFactory(user=auth_client.user)
        response = auth_client.put(
            _DOB_URL,
            {"birth_date": "1995-12-31", "visibility": "public"},
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data["birth_date"] == "1995-12-31"

    def test_put_returns_404_when_no_record(self, auth_client):
        response = auth_client.put(
            _DOB_URL,
            {"birth_date": "1995-01-01", "visibility": "private"},
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_put_invalid_data_returns_400(self, auth_client):
        AgeFactory(user=auth_client.user)
        response = auth_client.put(
            _DOB_URL,
            {"birth_date": "not-a-date", "visibility": "private"},
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "birth_date" in response.data

    # --- PATCH ---

    def test_patch_partial_update_returns_200(self, auth_client):
        AgeFactory(user=auth_client.user)
        response = auth_client.patch(_DOB_URL, {"visibility": "public"})
        assert response.status_code == status.HTTP_200_OK
        assert response.data["visibility"] == "public"

    def test_patch_returns_404_when_no_record(self, auth_client):
        response = auth_client.patch(_DOB_URL, {"visibility": "public"})
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_patch_invalid_data_returns_400(self, auth_client):
        AgeFactory(user=auth_client.user)
        response = auth_client.patch(_DOB_URL, {"birth_date": "not-a-date"})
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "birth_date" in response.data


# UserScopedModelViewSet — tested via AddressView


@pytest.mark.django_db
class TestUserScopedModelViewSet:
    # --- authentication ---

    def test_list_unauthenticated_returns_401(self, api_client):
        response = api_client.get(_ADDRESSES_URL)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_create_unauthenticated_returns_401(self, api_client):
        response = api_client.post(_ADDRESSES_URL, _ADDRESS_PAYLOAD)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    # --- LIST ---

    def test_list_returns_empty_when_no_records(self, auth_client):
        response = auth_client.get(_ADDRESSES_URL)
        assert response.status_code == status.HTTP_200_OK
        assert response.data == []

    def test_list_returns_own_records_only(self, auth_client):
        AddressFactory(user=auth_client.user)
        AddressFactory(user=auth_client.user)
        AddressFactory()  # different user — must not appear
        response = auth_client.get(_ADDRESSES_URL)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 2

    # --- CREATE ---

    def test_create_returns_201(self, auth_client):
        response = auth_client.post(_ADDRESSES_URL, _ADDRESS_PAYLOAD)
        assert response.status_code == status.HTTP_201_CREATED

    def test_create_assigns_record_to_authenticated_user(self, auth_client):
        auth_client.post(_ADDRESSES_URL, _ADDRESS_PAYLOAD)
        assert Address.objects.filter(user=auth_client.user).count() == 1

    def test_create_invalid_data_returns_400(self, auth_client):
        response = auth_client.post(
            _ADDRESSES_URL, {"resident_city": "London", "visibility": "private"}
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    # --- RETRIEVE ---

    def test_retrieve_own_record_returns_200(self, auth_client):
        addr = AddressFactory(user=auth_client.user)
        url = f"{_ADDRESSES_URL}{addr.pk}/"
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["resident_city"] == addr.resident_city

    def test_retrieve_other_users_record_returns_404(self, auth_client):
        other_addr = AddressFactory()  # different user
        url = f"{_ADDRESSES_URL}{other_addr.pk}/"
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    # --- UPDATE (PUT) ---

    def test_put_own_record_returns_200(self, auth_client):
        addr = AddressFactory(user=auth_client.user)
        url = f"{_ADDRESSES_URL}{addr.pk}/"
        payload = {**_ADDRESS_PAYLOAD, "resident_city": "Manchester"}
        response = auth_client.put(url, payload)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["resident_city"] == "Manchester"

    def test_put_other_users_record_returns_404(self, auth_client):
        other_addr = AddressFactory()
        url = f"{_ADDRESSES_URL}{other_addr.pk}/"
        response = auth_client.put(url, _ADDRESS_PAYLOAD)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    # --- PARTIAL UPDATE (PATCH) ---

    def test_patch_own_record_returns_200(self, auth_client):
        addr = AddressFactory(user=auth_client.user)
        url = f"{_ADDRESSES_URL}{addr.pk}/"
        response = auth_client.patch(url, {"resident_city": "Birmingham"})
        assert response.status_code == status.HTTP_200_OK
        assert response.data["resident_city"] == "Birmingham"

    # --- DELETE ---

    def test_delete_own_record_returns_204(self, auth_client):
        addr = AddressFactory(user=auth_client.user)
        url = f"{_ADDRESSES_URL}{addr.pk}/"
        response = auth_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Address.objects.filter(pk=addr.pk).exists()

    def test_delete_other_users_record_returns_404(self, auth_client):
        other_addr = AddressFactory()
        url = f"{_ADDRESSES_URL}{other_addr.pk}/"
        response = auth_client.delete(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert Address.objects.filter(pk=other_addr.pk).exists()


# AccessLogView (ReadOnly)


@pytest.mark.django_db
class TestAccessLogView:
    def test_list_unauthenticated_returns_401(self, api_client):
        response = api_client.get(_ACCESS_LOGS_URL)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_list_returns_own_logs_only(self, auth_client):
        AccessLogFactory(user=auth_client.user)
        AccessLogFactory(user=auth_client.user)
        AccessLogFactory()  # different user
        response = auth_client.get(_ACCESS_LOGS_URL)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 2
        assert len(response.data["results"]) == 2

    def test_list_empty_when_no_logs(self, auth_client):
        response = auth_client.get(_ACCESS_LOGS_URL)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 0
        assert response.data["results"] == []

    def test_list_ordered_by_access_time_descending(self, auth_client):
        now = timezone.now()
        older = AccessLogFactory(user=auth_client.user)
        older.access_time = now - timedelta(hours=2)
        older.save()
        newer = AccessLogFactory(user=auth_client.user)
        newer.access_time = now
        newer.save()
        response = auth_client.get(_ACCESS_LOGS_URL)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["results"][0]["relying_party"] == newer.relying_party

    def test_list_is_paginated_at_page_size_10(self, auth_client):
        for _ in range(15):
            AccessLogFactory(user=auth_client.user)
        response = auth_client.get(_ACCESS_LOGS_URL)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 15
        assert len(response.data["results"]) == 10
        assert response.data["next"] is not None
        assert response.data["previous"] is None

    def test_list_second_page_returns_remainder(self, auth_client):
        for _ in range(15):
            AccessLogFactory(user=auth_client.user)
        response = auth_client.get(_ACCESS_LOGS_URL, {"page": 2})
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 5
        assert response.data["next"] is None
        assert response.data["previous"] is not None

    def test_retrieve_own_log_returns_200(self, auth_client):
        log = AccessLogFactory(user=auth_client.user)
        url = f"{_ACCESS_LOGS_URL}{log.pk}/"
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["relying_party"] == log.relying_party

    def test_retrieve_other_users_log_returns_404(self, auth_client):
        other_log = AccessLogFactory()
        url = f"{_ACCESS_LOGS_URL}{other_log.pk}/"
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_post_not_allowed(self, auth_client):
        response = auth_client.post(_ACCESS_LOGS_URL, {"relying_party": "Acme"})
        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED

    def test_delete_not_allowed(self, auth_client):
        log = AccessLogFactory(user=auth_client.user)
        url = f"{_ACCESS_LOGS_URL}{log.pk}/"
        response = auth_client.delete(url)
        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED

    def test_put_not_allowed(self, auth_client):
        log = AccessLogFactory(user=auth_client.user)
        url = f"{_ACCESS_LOGS_URL}{log.pk}/"
        response = auth_client.put(url, {"relying_party": "Hacked"})
        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED

    def test_patch_not_allowed(self, auth_client):
        log = AccessLogFactory(user=auth_client.user)
        url = f"{_ACCESS_LOGS_URL}{log.pk}/"
        response = auth_client.patch(url, {"relying_party": "Hacked"})
        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED


# PlaceOfBirthView (spot-check)


@pytest.mark.django_db
class TestPlaceOfBirthView:
    _PAYLOAD = {"birth_city": "Rome", "birth_country": "IT", "visibility": "private"}

    def test_get_returns_404_when_no_record(self, auth_client):
        response = auth_client.get(_POB_URL)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_post_creates_record(self, auth_client):
        response = auth_client.post(_POB_URL, self._PAYLOAD)
        assert response.status_code == status.HTTP_201_CREATED
        assert PlaceOfBirth.objects.filter(user=auth_client.user).exists()

    def test_patch_updates_birth_city(self, auth_client):
        PlaceOfBirthFactory(user=auth_client.user)
        response = auth_client.patch(_POB_URL, {"birth_city": "Milan"})
        assert response.status_code == status.HTTP_200_OK
        assert response.data["birth_city"] == "Milan"

    def test_post_duplicate_returns_400(self, auth_client):
        PlaceOfBirthFactory(user=auth_client.user)
        response = auth_client.post(_POB_URL, self._PAYLOAD)
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_unauthenticated_returns_401(self, api_client):
        response = api_client.get(_POB_URL)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


# LegalIdentityView (spot-check)


@pytest.mark.django_db
class TestLegalIdentityView:
    _PAYLOAD = {"family_name": "Doe", "given_name": "Jane", "visibility": "private"}

    def test_get_returns_404_when_no_record(self, auth_client):
        response = auth_client.get(_LEGAL_URL)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_post_creates_record(self, auth_client):
        response = auth_client.post(_LEGAL_URL, self._PAYLOAD)
        assert response.status_code == status.HTTP_201_CREATED
        assert LegalIdentity.objects.filter(user=auth_client.user).exists()

    def test_post_duplicate_returns_400(self, auth_client):
        LegalIdentityFactory(user=auth_client.user)
        response = auth_client.post(_LEGAL_URL, self._PAYLOAD)
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_patch_updates_given_name(self, auth_client):
        LegalIdentityFactory(user=auth_client.user)
        response = auth_client.patch(_LEGAL_URL, {"given_name": "Alice"})
        assert response.status_code == status.HTTP_200_OK
        assert response.data["given_name"] == "Alice"

    def test_unauthenticated_returns_401(self, api_client):
        response = api_client.get(_LEGAL_URL)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


# GenderView (spot-check)


@pytest.mark.django_db
class TestGenderView:
    def test_list_returns_own_records_only(self, auth_client):
        GenderFactory(user=auth_client.user)
        GenderFactory()  # different user
        response = auth_client.get(_GENDER_URL)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1

    def test_create_returns_201(self, auth_client):
        response = auth_client.post(
            _GENDER_URL, {"gender": "non-binary", "visibility": "private"}
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert Gender.objects.filter(user=auth_client.user).exists()

    def test_delete_own_record(self, auth_client):
        g = GenderFactory(user=auth_client.user)
        response = auth_client.delete(f"{_GENDER_URL}{g.pk}/")
        assert response.status_code == status.HTTP_204_NO_CONTENT

    def test_list_unauthenticated_returns_401(self, api_client):
        response = api_client.get(_GENDER_URL)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_retrieve_other_users_record_returns_404(self, auth_client):
        other = GenderFactory()
        response = auth_client.get(f"{_GENDER_URL}{other.pk}/")
        assert response.status_code == status.HTTP_404_NOT_FOUND


# NationalityView (spot-check)


@pytest.mark.django_db
class TestNationalityView:
    def test_create_returns_201(self, auth_client):
        response = auth_client.post(
            _NATIONALITY_URL, {"nationality": "DE", "visibility": "public"}
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert Nationality.objects.filter(user=auth_client.user).exists()

    def test_list_returns_own_records_only(self, auth_client):
        NationalityFactory(user=auth_client.user)
        NationalityFactory()
        response = auth_client.get(_NATIONALITY_URL)
        assert len(response.data) == 1

    def test_list_unauthenticated_returns_401(self, api_client):
        response = api_client.get(_NATIONALITY_URL)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_retrieve_other_users_record_returns_404(self, auth_client):
        other = NationalityFactory()
        response = auth_client.get(f"{_NATIONALITY_URL}{other.pk}/")
        assert response.status_code == status.HTTP_404_NOT_FOUND


# CredentialView (spot-check)


@pytest.mark.django_db
class TestCredentialView:
    _PAYLOAD = {
        "credential_id": "CRED-001",
        "credential_type": "government",
        "credential_name": "Passport",
        "issuing_authority": "HMPO",
        "issuance_date": "2020-01-01",
        "visibility": "private",
    }

    def test_create_returns_201(self, auth_client):
        response = auth_client.post(_CREDENTIALS_URL, self._PAYLOAD)
        assert response.status_code == status.HTTP_201_CREATED
        assert Credential.objects.filter(user=auth_client.user).exists()

    def test_list_returns_own_records_only(self, auth_client):
        CredentialFactory(user=auth_client.user)
        CredentialFactory()
        response = auth_client.get(_CREDENTIALS_URL)
        assert len(response.data) == 1

    def test_list_unauthenticated_returns_401(self, api_client):
        response = api_client.get(_CREDENTIALS_URL)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_retrieve_other_users_record_returns_404(self, auth_client):
        other = CredentialFactory()
        response = auth_client.get(f"{_CREDENTIALS_URL}{other.pk}/")
        assert response.status_code == status.HTTP_404_NOT_FOUND


# ProfessionalIdentityView (spot-check)


@pytest.mark.django_db
class TestProfessionalIdentityView:
    def test_create_returns_201(self, auth_client):
        response = auth_client.post(
            _PROFESSIONALS_URL,
            {"job_title": "Engineer", "visibility": "private"},
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert ProfessionalIdentity.objects.filter(user=auth_client.user).exists()

    def test_list_returns_own_records_only(self, auth_client):
        ProfessionalIdentityFactory(user=auth_client.user)
        ProfessionalIdentityFactory()
        response = auth_client.get(_PROFESSIONALS_URL)
        assert len(response.data) == 1

    def test_list_unauthenticated_returns_401(self, api_client):
        response = api_client.get(_PROFESSIONALS_URL)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_retrieve_other_users_record_returns_404(self, auth_client):
        other = ProfessionalIdentityFactory()
        response = auth_client.get(f"{_PROFESSIONALS_URL}{other.pk}/")
        assert response.status_code == status.HTTP_404_NOT_FOUND


# OnlineProfileView (spot-check)


@pytest.mark.django_db
class TestOnlineProfileView:
    def test_create_returns_201(self, auth_client):
        response = auth_client.post(
            _ONLINE_PROFILES_URL,
            {"platform": "github", "username": "octocat", "visibility": "public"},
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert OnlineProfile.objects.filter(user=auth_client.user).exists()

    def test_list_returns_own_records_only(self, auth_client):
        OnlineProfileFactory(user=auth_client.user)
        OnlineProfileFactory()
        response = auth_client.get(_ONLINE_PROFILES_URL)
        assert len(response.data) == 1

    def test_list_unauthenticated_returns_401(self, api_client):
        response = api_client.get(_ONLINE_PROFILES_URL)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_retrieve_other_users_record_returns_404(self, auth_client):
        other = OnlineProfileFactory()
        response = auth_client.get(f"{_ONLINE_PROFILES_URL}{other.pk}/")
        assert response.status_code == status.HTTP_404_NOT_FOUND


# PseudonymView (spot-check)


@pytest.mark.django_db
class TestPseudonymView:
    def test_create_returns_201(self, auth_client):
        response = auth_client.post(
            _PSEUDONYMS_URL,
            {
                "relying_party": "Acme",
                "pseudonym_value": "shadow_99",
                "visibility": "private",
            },
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert Pseudonym.objects.filter(user=auth_client.user).exists()

    def test_list_returns_own_records_only(self, auth_client):
        PseudonymFactory(user=auth_client.user)
        PseudonymFactory()
        response = auth_client.get(_PSEUDONYMS_URL)
        assert len(response.data) == 1

    def test_list_unauthenticated_returns_401(self, api_client):
        response = api_client.get(_PSEUDONYMS_URL)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_retrieve_other_users_record_returns_404(self, auth_client):
        other = PseudonymFactory()
        response = auth_client.get(f"{_PSEUDONYMS_URL}{other.pk}/")
        assert response.status_code == status.HTTP_404_NOT_FOUND


# DailyUseView (spot-check)


@pytest.mark.django_db
class TestDailyUseView:
    def test_create_returns_201(self, auth_client):
        response = auth_client.post(
            _DAILY_USES_URL,
            {"preferred_name": "Joey", "visibility": "private"},
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert DailyUse.objects.filter(user=auth_client.user).exists()

    def test_list_returns_own_records_only(self, auth_client):
        DailyUseFactory(user=auth_client.user)
        DailyUseFactory()
        response = auth_client.get(_DAILY_USES_URL)
        assert len(response.data) == 1

    def test_list_unauthenticated_returns_401(self, api_client):
        response = api_client.get(_DAILY_USES_URL)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_retrieve_other_users_record_returns_404(self, auth_client):
        other = DailyUseFactory()
        response = auth_client.get(f"{_DAILY_USES_URL}{other.pk}/")
        assert response.status_code == status.HTTP_404_NOT_FOUND


# CustomObjectView (spot-check)


@pytest.mark.django_db
class TestCustomObjectView:
    def test_create_returns_201(self, auth_client):
        response = auth_client.post(
            _CUSTOM_OBJECTS_URL,
            {
                "name_type": "employee_id",
                "name_value": "EMP-999",
                "visibility": "private",
            },
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert CustomObject.objects.filter(user=auth_client.user).exists()

    def test_list_returns_own_records_only(self, auth_client):
        CustomObjectFactory(user=auth_client.user)
        CustomObjectFactory()
        response = auth_client.get(_CUSTOM_OBJECTS_URL)
        assert len(response.data) == 1

    def test_create_invalid_name_type_returns_400(self, auth_client):
        response = auth_client.post(
            _CUSTOM_OBJECTS_URL,
            {
                "name_type": "has spaces!",
                "name_value": "VAL-001",
                "visibility": "private",
            },
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_list_unauthenticated_returns_401(self, api_client):
        response = api_client.get(_CUSTOM_OBJECTS_URL)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_retrieve_other_users_record_returns_404(self, auth_client):
        other = CustomObjectFactory()
        response = auth_client.get(f"{_CUSTOM_OBJECTS_URL}{other.pk}/")
        assert response.status_code == status.HTTP_404_NOT_FOUND


# NameHistoryView (spot-check)


@pytest.mark.django_db
class TestNameHistoryView:
    def test_create_returns_201(self, auth_client):
        response = auth_client.post(_NAME_HISTORIES_URL, _NAME_HISTORY_PAYLOAD)
        assert response.status_code == status.HTTP_201_CREATED
        assert NameHistory.objects.filter(user=auth_client.user).exists()

    def test_list_returns_own_records_only(self, auth_client):
        NameHistoryFactory(user=auth_client.user)
        NameHistoryFactory()
        response = auth_client.get(_NAME_HISTORIES_URL)
        assert len(response.data) == 1

    def test_list_unauthenticated_returns_401(self, api_client):
        response = api_client.get(_NAME_HISTORIES_URL)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_retrieve_other_users_record_returns_404(self, auth_client):
        other = NameHistoryFactory()
        response = auth_client.get(f"{_NAME_HISTORIES_URL}{other.pk}/")
        assert response.status_code == status.HTTP_404_NOT_FOUND


# WalletExportView


@pytest.mark.django_db
class TestWalletExportView:
    def test_get_unauthenticated_returns_401(self, api_client):
        response = api_client.get(_EXPORT_URL)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_get_returns_200_with_valid_json_body(self, auth_client):
        AddressFactory(user=auth_client.user)
        response = auth_client.get(_EXPORT_URL)
        assert response.status_code == status.HTTP_200_OK
        payload = json.loads(response.content)
        assert payload["user"]["email"] == auth_client.user.email
        assert len(payload["addresses"]) == 1

    def test_get_sets_content_disposition_header(self, auth_client):
        response = auth_client.get(_EXPORT_URL)
        assert "attachment" in response["Content-Disposition"]
        assert "wallet_export.json" in response["Content-Disposition"]

    def test_get_empty_wallet_returns_200_with_empty_structure(self, auth_client):
        response = auth_client.get(_EXPORT_URL)
        assert response.status_code == status.HTTP_200_OK
        payload = json.loads(response.content)
        assert payload["date_of_birth"] is None
        assert payload["addresses"] == []

    def test_get_only_includes_requesting_users_data(self, auth_client):
        AddressFactory(user=auth_client.user)
        AddressFactory()  # different user
        NameHistoryFactory()  # different user
        response = auth_client.get(_EXPORT_URL)
        payload = json.loads(response.content)
        assert len(payload["addresses"]) == 1
        assert payload["name_histories"] == []

    def test_get_returns_500_when_export_fails(self, auth_client):
        with patch(
            "wallet.views.export_wallet_data_to_json",
            side_effect=WalletExportError("boom"),
        ):
            response = auth_client.get(_EXPORT_URL)
        assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
        assert response.data["detail"] == "boom"
