from django.db import transaction
from rest_framework import serializers
from .models import (
    Age,
    PrivacyMetadata,
    PlaceOfBirth,
    LegalIdentity,
    Address,
    Gender,
    Nationality,
    Credential,
    ProfessionalIdentity,
    OnlineProfile,
    Pseudonym,
    DailyUse,
    CustomObject,
    NameHistory,
    AccessLog,
)


class PrivacyMetadataMixin(serializers.ModelSerializer):
    visibility = serializers.ChoiceField(
        choices=PrivacyMetadata.VISIBILITY_CHOICES,
        source="privacy_metadata.visibility",
    )

    def create(self, validated_data):
        privacy_data = validated_data.pop("privacy_metadata", {})
        visibility = privacy_data.get("visibility", PrivacyMetadata.PUBLIC)
        with transaction.atomic():
            privacy = PrivacyMetadata.objects.create(visibility=visibility)
            return super().create({"privacy_metadata": privacy, **validated_data})

    def update(self, instance, validated_data):
        privacy_data = validated_data.pop("privacy_metadata", {})
        if "visibility" in privacy_data and instance.privacy_metadata is not None:
            instance.privacy_metadata.visibility = privacy_data["visibility"]
            instance.privacy_metadata.save()
        return super().update(instance, validated_data)


class DateOfBirthSerializer(PrivacyMetadataMixin):
    class Meta:
        model = Age
        fields = ["user", "birth_date", "visibility"]
        read_only_fields = ["user"]


class PlaceOfBirthSerializer(PrivacyMetadataMixin):
    class Meta:
        model = PlaceOfBirth
        fields = ["user", "birth_city", "birth_state", "birth_country", "visibility"]
        read_only_fields = ["user"]


class LegalIdentitySerializer(PrivacyMetadataMixin):
    class Meta:
        model = LegalIdentity
        fields = [
            "user",
            "family_name",
            "middle_name",
            "given_name",
            "family_name_birth",
            "given_name_birth",
            "visibility",
        ]
        read_only_fields = ["user"]


class AddressSerializer(PrivacyMetadataMixin):
    class Meta:
        model = Address
        fields = [
            "user",
            "address_type",
            "resident_country",
            "resident_state",
            "resident_city",
            "resident_postal_code",
            "resident_street",
            "resident_house_number",
            "visibility",
        ]
        read_only_fields = ["user"]


class GenderSerializer(PrivacyMetadataMixin):
    class Meta:
        model = Gender
        fields = ["user", "gender", "visibility"]
        read_only_fields = ["user"]


class NationalitySerializer(PrivacyMetadataMixin):
    class Meta:
        model = Nationality
        fields = ["user", "nationality", "visibility"]
        read_only_fields = ["user"]


class CredentialSerializer(PrivacyMetadataMixin):
    class Meta:
        model = Credential
        fields = [
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
        ]
        read_only_fields = ["user"]


class ProfessionalIdentitySerializer(PrivacyMetadataMixin):
    class Meta:
        model = ProfessionalIdentity
        fields = [
            "user",
            "job_title",
            "role_description",
            "employee_number",
            "visibility",
        ]
        read_only_fields = ["user"]


class OnlineProfileSerializer(PrivacyMetadataMixin):
    class Meta:
        model = OnlineProfile
        fields = [
            "user",
            "platform",
            "username",
            "display_name",
            "visibility",
        ]
        read_only_fields = ["user"]


class PseudonymSerializer(PrivacyMetadataMixin):
    class Meta:
        model = Pseudonym
        fields = [
            "user",
            "relying_party",
            "pseudonym_value",
            "is_active",
            "visibility",
        ]
        read_only_fields = ["user"]


class DailyUseSerializer(PrivacyMetadataMixin):
    class Meta:
        model = DailyUse
        fields = [
            "user",
            "preferred_name",
            "nickname",
            "visibility",
        ]
        read_only_fields = ["user"]


class CustomObjectSerializer(PrivacyMetadataMixin):
    class Meta:
        model = CustomObject
        fields = [
            "user",
            "name_type",
            "name_value",
            "visibility",
        ]
        read_only_fields = ["user", "created_at", "updated_at"]


class NameHistorySerializer(PrivacyMetadataMixin):
    class Meta:
        model = NameHistory
        fields = [
            "user",
            "family_name",
            "middle_name",
            "given_name",
            "valid_from",
            "valid_until",
            "visibility",
        ]
        read_only_fields = ["user"]


class AccessLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccessLog
        fields = [
            "user",
            "relying_party",
            "application",
            "scopes_accessed",
            "claims_returned",
            "access_time",
        ]
        read_only_fields = [
            "user",
            "relying_party",
            "application",
            "scopes_accessed",
            "claims_returned",
            "access_time",
        ]
