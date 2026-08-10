from django.db import transaction

from .export_service import _MULTI_RECORD_FIELDS, _SINGLETON_FIELDS
from .models import CustomUser, PrivacyMetadata


class AccountDeletionError(Exception):
    """Raised when a user's account and wallet data cannot be fully deleted."""


def _collect_privacy_metadata_ids(user):
    """Gather PrivacyMetadata pks referenced by this user's records.

    Deleting CustomUser cascades to every model below, but PrivacyMetadata
    itself has no FK back to CustomUser, so it is never cascade-deleted and
    must be collected up front and removed separately.
    """
    ids = set()

    for _key, related_name, serializer_class in _SINGLETON_FIELDS:
        model_class = serializer_class.Meta.model
        try:
            instance = getattr(user, related_name)
        except model_class.DoesNotExist:
            instance = None
        if instance is not None:
            ids.add(instance.privacy_metadata_id)

    for _key, model_class, _serializer_class in _MULTI_RECORD_FIELDS:
        ids.update(
            model_class.objects.filter(user=user).values_list(
                "privacy_metadata_id", flat=True
            )
        )

    return ids


def delete_wallet_account(user):
    """Permanently delete a user's account and all associated wallet data."""
    if not isinstance(user, CustomUser):
        raise AccountDeletionError("A valid user is required to delete an account.")

    try:
        with transaction.atomic():
            privacy_metadata_ids = _collect_privacy_metadata_ids(user)
            user.delete()
            PrivacyMetadata.objects.filter(pk__in=privacy_metadata_ids).delete()
    except Exception as exc:
        raise AccountDeletionError(f"Failed to delete account: {exc}") from exc
