import json

from django.utils import timezone

from .models import (
    Address,
    Credential,
    CustomObject,
    CustomUser,
    DailyUse,
    Gender,
    NameHistory,
    Nationality,
    OnlineProfile,
    ProfessionalIdentity,
    Pseudonym,
)
from .serializers import (
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


class WalletExportError(Exception):
    """Raised when a user's wallet data cannot be built, serialized, or written to disk."""


_SINGLETON_FIELDS = (
    # (export key, related_name on CustomUser, serializer class)
    ("date_of_birth", "age", DateOfBirthSerializer),
    ("place_of_birth", "place_of_birth", PlaceOfBirthSerializer),
    ("legal_identity", "legal_identity", LegalIdentitySerializer),
)

_MULTI_RECORD_FIELDS = (
    # (export key, model class, serializer class)
    ("addresses", Address, AddressSerializer),
    ("genders", Gender, GenderSerializer),
    ("nationalities", Nationality, NationalitySerializer),
    ("credentials", Credential, CredentialSerializer),
    ("professional_identities", ProfessionalIdentity, ProfessionalIdentitySerializer),
    ("online_profiles", OnlineProfile, OnlineProfileSerializer),
    ("pseudonyms", Pseudonym, PseudonymSerializer),
    ("daily_uses", DailyUse, DailyUseSerializer),
    ("custom_objects", CustomObject, CustomObjectSerializer),
    ("name_histories", NameHistory, NameHistorySerializer),
)


def build_wallet_export_data(user):
    """Gather all of a user's wallet data into a JSON-serializable dict."""
    if not isinstance(user, CustomUser):
        raise WalletExportError("A valid user is required to export wallet data.")

    data = {
        "user": {
            "id": str(user.id),
            "email": user.email,
            "date_joined": user.created_at.isoformat(),
        },
        "exported_at": timezone.now().isoformat(),
    }

    for key, related_name, serializer_class in _SINGLETON_FIELDS:
        model_class = serializer_class.Meta.model
        try:
            instance = getattr(user, related_name)
        except model_class.DoesNotExist:
            instance = None
        data[key] = serializer_class(instance).data if instance is not None else None

    for key, model_class, serializer_class in _MULTI_RECORD_FIELDS:
        queryset = model_class.objects.filter(user=user)
        data[key] = serializer_class(queryset, many=True).data

    data["access_logs"] = AccessLogSerializer(
        user.access_logs.all().order_by("-access_time"), many=True
    ).data

    return data


def serialize_wallet_data_to_json(data, file_path=None, indent=2):
    """Serialize a dict to a JSON string, optionally writing it to file_path."""
    if not isinstance(data, dict):
        raise WalletExportError("Wallet export data must be a dictionary.")

    try:
        json_string = json.dumps(data, indent=indent, default=str)
    except (TypeError, ValueError) as exc:
        raise WalletExportError(f"Failed to serialize wallet data to JSON: {exc}") from exc

    if file_path is not None:
        try:
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(json_string)
        except OSError as exc:
            raise WalletExportError(
                f"Failed to write wallet export to file '{file_path}': {exc}"
            ) from exc

    return json_string


def export_wallet_data_to_json(user, file_path=None):
    """Build and serialize a user's wallet data, returning the JSON string."""
    data = build_wallet_export_data(user)
    return serialize_wallet_data_to_json(data, file_path=file_path)
