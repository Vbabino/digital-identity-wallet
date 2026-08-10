from unittest.mock import patch

import pytest

from wallet.account_deletion_service import AccountDeletionError, delete_wallet_account
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
from wallet.models import (
    Address,
    Age,
    CustomUser,
    LegalIdentity,
    NameHistory,
    PlaceOfBirth,
    PrivacyMetadata,
)


def _create_full_wallet(user):
    age = AgeFactory(user=user)
    place_of_birth = PlaceOfBirthFactory(user=user)
    legal_identity = LegalIdentityFactory(user=user)
    address = AddressFactory(user=user)
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
    return {
        "age": age,
        "place_of_birth": place_of_birth,
        "legal_identity": legal_identity,
        "address": address,
    }


@pytest.mark.django_db
class TestDeleteWalletAccount:
    def test_deletes_the_user(self, user):
        user_id = user.id
        delete_wallet_account(user)
        assert not CustomUser.objects.filter(pk=user_id).exists()

    def test_cascades_singleton_and_multi_record_data(self, user):
        records = _create_full_wallet(user)
        address_id = records["address"].pk
        name_history = NameHistory.objects.filter(user=user).first()
        name_history_id = name_history.pk

        delete_wallet_account(user)

        assert not Age.objects.filter(pk=records["age"].pk).exists()
        assert not PlaceOfBirth.objects.filter(pk=records["place_of_birth"].pk).exists()
        assert not LegalIdentity.objects.filter(pk=records["legal_identity"].pk).exists()
        assert not Address.objects.filter(pk=address_id).exists()
        assert not NameHistory.objects.filter(pk=name_history_id).exists()

    def test_removes_orphaned_privacy_metadata(self, user):
        records = _create_full_wallet(user)
        privacy_metadata_ids = [
            records["age"].privacy_metadata_id,
            records["place_of_birth"].privacy_metadata_id,
            records["legal_identity"].privacy_metadata_id,
            records["address"].privacy_metadata_id,
        ]

        delete_wallet_account(user)

        assert not PrivacyMetadata.objects.filter(pk__in=privacy_metadata_ids).exists()

    def test_succeeds_for_a_user_with_no_wallet_data(self, user):
        user_id = user.id
        delete_wallet_account(user)
        assert not CustomUser.objects.filter(pk=user_id).exists()

    def test_does_not_affect_other_users_data(self, user):
        other_user = CustomUserFactory()
        other_address = AddressFactory(user=other_user)
        other_privacy_metadata_id = other_address.privacy_metadata_id

        delete_wallet_account(user)

        assert CustomUser.objects.filter(pk=other_user.pk).exists()
        assert Address.objects.filter(pk=other_address.pk).exists()
        assert PrivacyMetadata.objects.filter(pk=other_privacy_metadata_id).exists()

    def test_raises_for_none_user(self):
        with pytest.raises(AccountDeletionError):
            delete_wallet_account(None)

    def test_raises_for_invalid_user_type(self):
        with pytest.raises(AccountDeletionError):
            delete_wallet_account("not-a-user")

    def test_wraps_unexpected_errors_in_account_deletion_error(self, user):
        with patch("wallet.models.CustomUser.delete", side_effect=RuntimeError("db exploded")):
            with pytest.raises(AccountDeletionError, match="db exploded"):
                delete_wallet_account(user)
