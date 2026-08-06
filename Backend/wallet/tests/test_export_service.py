import json
from unittest.mock import patch

import pytest

from wallet.export_service import (
    WalletExportError,
    build_wallet_export_data,
    export_wallet_data_to_json,
    serialize_wallet_data_to_json,
)
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


def _create_full_wallet(user):
    AgeFactory(user=user)
    PlaceOfBirthFactory(user=user)
    LegalIdentityFactory(user=user)
    AddressFactory(user=user)
    GenderFactory(user=user)
    NationalityFactory(user=user)
    CredentialFactory(user=user)
    ProfessionalIdentityFactory(user=user)
    OnlineProfileFactory(user=user)
    PseudonymFactory(user=user)
    DailyUseFactory(user=user)
    CustomObjectFactory(user=user)
    NameHistoryFactory(user=user)
    AccessLogFactory(user=user)


@pytest.mark.django_db
class TestBuildWalletExportData:
    def test_includes_user_info(self, user):
        data = build_wallet_export_data(user)
        assert data["user"]["id"] == str(user.id)
        assert data["user"]["email"] == user.email
        assert "date_joined" in data["user"]

    def test_includes_export_timestamp(self, user):
        data = build_wallet_export_data(user)
        assert "exported_at" in data

    def test_empty_wallet_singletons_are_none(self, user):
        data = build_wallet_export_data(user)
        assert data["date_of_birth"] is None
        assert data["place_of_birth"] is None
        assert data["legal_identity"] is None

    def test_empty_wallet_collections_are_empty_lists(self, user):
        data = build_wallet_export_data(user)
        for key in (
            "addresses",
            "genders",
            "nationalities",
            "credentials",
            "professional_identities",
            "online_profiles",
            "pseudonyms",
            "daily_uses",
            "custom_objects",
            "name_histories",
            "access_logs",
        ):
            assert data[key] == []

    def test_full_wallet_populates_singletons(self, user):
        _create_full_wallet(user)
        data = build_wallet_export_data(user)
        assert data["date_of_birth"] is not None
        assert data["place_of_birth"] is not None
        assert data["legal_identity"] is not None

    def test_full_wallet_populates_collections_with_one_record_each(self, user):
        _create_full_wallet(user)
        data = build_wallet_export_data(user)
        for key in (
            "addresses",
            "genders",
            "nationalities",
            "credentials",
            "professional_identities",
            "online_profiles",
            "pseudonyms",
            "daily_uses",
            "custom_objects",
            "name_histories",
            "access_logs",
        ):
            assert len(data[key]) == 1

    def test_raises_for_none_user(self):
        with pytest.raises(WalletExportError):
            build_wallet_export_data(None)

    def test_raises_for_invalid_user_type(self):
        with pytest.raises(WalletExportError):
            build_wallet_export_data("not-a-user")

    def test_scopes_data_to_given_user_only(self, user):
        other_user = CustomUserFactory()
        AddressFactory(user=other_user)
        NameHistoryFactory(user=other_user)
        data = build_wallet_export_data(user)
        assert data["addresses"] == []
        assert data["name_histories"] == []


class TestSerializeWalletDataToJson:
    def test_returns_valid_json_string(self):
        result = serialize_wallet_data_to_json({"a": 1, "b": [1, 2, 3]})
        assert json.loads(result) == {"a": 1, "b": [1, 2, 3]}

    def test_raises_for_non_dict_input(self):
        with pytest.raises(WalletExportError):
            serialize_wallet_data_to_json(["not", "a", "dict"])

    def test_raises_for_none_input(self):
        with pytest.raises(WalletExportError):
            serialize_wallet_data_to_json(None)

    def test_handles_special_characters(self):
        payload = {
            "name": "José O'Brien \"The Great\" 😀",
            "note": "line1\nline2\ttabbed",
            "unicode": "你好世界",
        }
        result = serialize_wallet_data_to_json(payload)
        assert json.loads(result) == payload

    def test_handles_large_dataset(self):
        payload = {"records": [{"index": i, "value": f"item-{i}"} for i in range(5000)]}
        result = serialize_wallet_data_to_json(payload)
        parsed = json.loads(result)
        assert len(parsed["records"]) == 5000
        assert parsed["records"][4999]["index"] == 4999

    def test_raises_for_circular_reference(self):
        payload = {}
        payload["self"] = payload
        with pytest.raises(WalletExportError):
            serialize_wallet_data_to_json(payload)

    def test_writes_to_file_when_path_given(self, tmp_path):
        file_path = tmp_path / "export.json"
        result = serialize_wallet_data_to_json({"a": 1}, file_path=str(file_path))
        assert file_path.read_text(encoding="utf-8") == result

    def test_raises_descriptive_error_when_directory_missing(self, tmp_path):
        file_path = tmp_path / "nonexistent-dir" / "export.json"
        with pytest.raises(WalletExportError) as exc_info:
            serialize_wallet_data_to_json({"a": 1}, file_path=str(file_path))
        assert str(file_path) in str(exc_info.value)

    def test_raises_descriptive_error_on_file_write_failure(self, tmp_path):
        file_path = tmp_path / "export.json"
        with patch("builtins.open", side_effect=OSError("disk full")):
            with pytest.raises(WalletExportError) as exc_info:
                serialize_wallet_data_to_json({"a": 1}, file_path=str(file_path))
        assert str(file_path) in str(exc_info.value)


@pytest.mark.django_db
class TestExportWalletDataToJson:
    def test_returns_valid_json_for_populated_wallet(self, user):
        _create_full_wallet(user)
        result = export_wallet_data_to_json(user)
        parsed = json.loads(result)
        assert parsed["user"]["email"] == user.email
        assert len(parsed["addresses"]) == 1

    def test_returns_valid_json_for_empty_wallet(self, user):
        result = export_wallet_data_to_json(user)
        parsed = json.loads(result)
        assert parsed["date_of_birth"] is None
        assert parsed["addresses"] == []

    def test_writes_file_when_path_provided(self, user, tmp_path):
        file_path = tmp_path / "wallet_export.json"
        result = export_wallet_data_to_json(user, file_path=str(file_path))
        assert file_path.read_text(encoding="utf-8") == result

    def test_raises_walletexporterror_for_invalid_user(self):
        with pytest.raises(WalletExportError):
            export_wallet_data_to_json(None)
