import re
import uuid
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.core.exceptions import ValidationError
from django.db import models
from .managers import CustomUserManager
from django_countries.fields import CountryField


def validate_scope_name(value):
    if not re.match(r'^[a-zA-Z0-9_]+$', value):
        raise ValidationError("Must contain only letters, digits, and underscores.")


class CustomUser(AbstractBaseUser, PermissionsMixin):
    """Model definition for CustomUser."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return f"User: {self.email}"


class PrivacyMetadata(models.Model):
    """Model definition for PrivacyMetadata."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    visibility = models.CharField(max_length=50)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        """Meta definition for PrivacyMetadata."""

        verbose_name = "Privacy Metadata"
        verbose_name_plural = "Privacy Metadata Records"

    def __str__(self):
        """Unicode representation of Privacy Metadata."""
        return f"Visibility: {self.visibility}"


class Age(models.Model):
    """Model definition for Age."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        CustomUser, on_delete=models.CASCADE, related_name="age"
    )
    privacy_metadata = models.ForeignKey(
        PrivacyMetadata, on_delete=models.CASCADE, related_name="ages"
    )
    birth_date = models.DateField(
        auto_now=False, auto_now_add=False, blank=False, null=False
    )

    class Meta:
        """Meta definition for Age."""

        verbose_name = "Age"
        verbose_name_plural = "Ages"

    def __str__(self):
        """Unicode representation of Age."""
        return f"Birth Date: {self.birth_date}"


class PlaceOfBirth(models.Model):
    """Model definition for Place of Birth."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        CustomUser, on_delete=models.CASCADE, related_name="place_of_birth"
    )
    privacy_metadata = models.ForeignKey(
        PrivacyMetadata, on_delete=models.CASCADE, related_name="place_of_birth"
    )
    birth_country = CountryField()
    birth_state = models.CharField(max_length=255)
    birth_city = models.CharField(max_length=255)

    class Meta:
        """Meta definition for Place of Birth."""

        verbose_name = "Place of Birth"
        verbose_name_plural = "Places of Birth"

    def __str__(self):
        """Unicode representation of PlaceOfBirth."""
        return f"{self.birth_city}, {self.birth_state}"


class Address(models.Model):
    """Model definition for Address."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="addresses"
    )
    privacy_metadata = models.ForeignKey(
        PrivacyMetadata, on_delete=models.CASCADE, related_name="addresses"
    )
    address_type = models.CharField(max_length=50)
    resident_country = CountryField()
    resident_state = models.CharField(max_length=255)
    resident_city = models.CharField(max_length=255)
    resident_postal_code = models.CharField(max_length=30)
    resident_street = models.CharField(max_length=255)
    resident_house_number = models.CharField(max_length=30)

    class Meta:
        """Meta definition for Address."""

        verbose_name = "Address"
        verbose_name_plural = "Addresses"

    def __str__(self):
        """Unicode representation of Address."""
        return f"{self.address_type} - {self.resident_city}, {self.resident_state}"


class Gender(models.Model):
    """Model definition for Gender."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="genders"
    )
    privacy_metadata = models.ForeignKey(
        PrivacyMetadata, on_delete=models.CASCADE, related_name="genders"
    )

    gender = models.CharField(max_length=255)

    class Meta:
        """Meta definition for Gender."""

        verbose_name = "Gender"
        verbose_name_plural = "Genders"

    def __str__(self):
        """Unicode representation of Gender."""
        return f"{self.gender}"


class Nationality(models.Model):
    """Model definition for Nationality."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="nationalities"
    )
    privacy_metadata = models.ForeignKey(
        PrivacyMetadata, on_delete=models.CASCADE, related_name="nationalities"
    )
    nationality = CountryField()

    class Meta:
        """Meta definition for Nationality."""

        verbose_name = "Nationality"
        verbose_name_plural = "Nationalities"

    def __str__(self):
        """Unicode representation of Nationality."""
        return f"{self.nationality}"


class AccessLog(models.Model):
    """Model definition for AccessLog."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="access_logs"
    )
    relying_party = models.CharField(max_length=255)
    access_time = models.DateTimeField(auto_now_add=True)

    class Meta:
        """Meta definition for AccessLog."""

        verbose_name = "Access Log"
        verbose_name_plural = "Access Logs"

    def __str__(self):
        """Unicode representation of AccessLog."""
        return f"Access by {self.relying_party} at {self.access_time}"


class Credential(models.Model):
    """Model definition for Credential."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="credentials"
    )
    privacy_metadata = models.ForeignKey(
        PrivacyMetadata, on_delete=models.CASCADE, related_name="credentials"
    )
    credential_name = models.CharField(max_length=255)
    credential_type = models.CharField(max_length=255)
    credential_description = models.TextField()
    credential_id = models.CharField(max_length=255)
    issuing_authority = models.CharField(max_length=255)
    issuance_date = models.DateField(auto_now=False, auto_now_add=False)
    expiry_date = models.DateField(auto_now=False, auto_now_add=False)
    credential_url = models.URLField(max_length=500, blank=True, null=True)

    class Meta:
        """Meta definition for Credential."""

        verbose_name = "Credential"
        verbose_name_plural = "Credentials"

    def __str__(self):
        """Unicode representation of Credential."""
        return f"Credential for {self.user} issued at {self.issuance_date}"


class LegalIdentity(models.Model):
    """Model definition for LegalIdentity."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        CustomUser, on_delete=models.CASCADE, related_name="legal_identity"
    )
    privacy_metadata = models.ForeignKey(
        PrivacyMetadata, on_delete=models.CASCADE, related_name="legal_identities"
    )
    family_name = models.CharField(max_length=255, blank=False, null=False)
    middle_name = models.CharField(max_length=255, blank=True, null=True)
    given_name = models.CharField(max_length=255, blank=False, null=False)
    family_name_birth = models.CharField(max_length=255, blank=True, null=True)
    given_name_birth = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        """Meta definition for LegalIdentity."""

        verbose_name = "Legal Identity"
        verbose_name_plural = "Legal Identities"

    def __str__(self):
        """Unicode representation of LegalIdentity."""
        return f"{self.given_name} {self.family_name}"


class ProfessionalIdentity(models.Model):
    """Model definition for ProfessionalIdentity."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="professional_identities"
    )
    privacy_metadata = models.ForeignKey(
        PrivacyMetadata,
        on_delete=models.CASCADE,
        related_name="professional_identities",
    )
    job_title = models.CharField(max_length=255)
    role_description = models.TextField(blank=True, null=True)
    employee_number = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        """Meta definition for ProfessionalIdentity."""

        verbose_name = "Professional Identity"
        verbose_name_plural = "Professional Identities"

    def __str__(self):
        """Unicode representation of ProfessionalIdentity."""
        return f"{self.job_title} - {self.role_description}"


class OnlineProfile(models.Model):
    """Model definition for OnlineProfile."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="online_profiles"
    )
    privacy_metadata = models.ForeignKey(
        PrivacyMetadata, on_delete=models.CASCADE, related_name="online_profiles"
    )
    platform = models.CharField(max_length=255)
    username = models.CharField(max_length=255)
    display_name = models.CharField(max_length=255, blank=True, null=True)
    extra_fields = models.JSONField(blank=True, null=True)

    class Meta:
        """Meta definition for OnlineProfiles."""

        verbose_name = "Online Profile"
        verbose_name_plural = "Online Profiles"

    def __str__(self):
        """Unicode representation of OnlineProfile."""
        return f"{self.platform} - {self.username}"


class Pseudonym(models.Model):
    """Model definition for Pseudonym."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="pseudonyms"
    )
    privacy_metadata = models.ForeignKey(
        PrivacyMetadata, on_delete=models.CASCADE, related_name="pseudonyms"
    )
    relying_party = models.CharField(max_length=255)
    pseudonym_value = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        """Meta definition for Pseudonym."""

        verbose_name = "Pseudonym Identity"
        verbose_name_plural = "Pseudonym Identities"

    def __str__(self):
        """Unicode representation of Pseudonym."""
        return self.pseudonym_value


class DailyUse(models.Model):
    """Model definition for DailyUse."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="daily_uses"
    )
    privacy_metadata = models.ForeignKey(
        PrivacyMetadata, on_delete=models.CASCADE, related_name="daily_uses"
    )
    preferred_name = models.CharField(max_length=255, blank=True, null=True)
    nickname = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        """Meta definition for DailyUse."""

        verbose_name = "Daily Use Identity"
        verbose_name_plural = "Daily Use Identities"

    def __str__(self):
        """Unicode representation of DailyUse."""
        return self.preferred_name or self.nickname or "Daily Use Identity"


class CustomObject(models.Model):
    """Model definition for CustomObject."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="custom_objects"
    )

    privacy_metadata = models.ForeignKey(
        PrivacyMetadata, on_delete=models.CASCADE, related_name="custom_objects"
    )

    name_type = models.CharField(max_length=255, validators=[validate_scope_name])
    name_value = models.CharField(max_length=255)

    class Meta:
        """Meta definition for CustomObject."""

        verbose_name = "Custom Object"
        verbose_name_plural = "Custom Objects"

    def __str__(self):
        """Unicode representation of CustomObject."""
        return f"Custom Object for {self.user} with attribute {self.name_type}"


class NameHistory(models.Model):
    """Model definition for NameHistory."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="name_histories"
    )
    privacy_metadata = models.ForeignKey(
        PrivacyMetadata, on_delete=models.CASCADE, related_name="name_histories"
    )
    family_name = models.CharField(max_length=255, blank=False, null=False)
    middle_name = models.CharField(max_length=255, blank=True, null=True)
    given_name = models.CharField(max_length=255, blank=False, null=False)
    valid_from = models.DateTimeField(auto_now=False, auto_now_add=False)
    valid_until = models.DateTimeField(auto_now=False, auto_now_add=False)

    class Meta:
        """Meta definition for NameHistory."""

        verbose_name = "Name History"
        verbose_name_plural = "Name Histories"

    def __str__(self):
        """Unicode representation of NameHistory."""
        return f"Name changed from {self.given_name} {self.family_name} on {self.valid_from} until {self.valid_until}"
