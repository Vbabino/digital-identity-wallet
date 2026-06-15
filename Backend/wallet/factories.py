from datetime import timedelta
import random

import factory
from django.utils import timezone
from factory.django import DjangoModelFactory

from . import models


class CustomUserFactory(DjangoModelFactory):
    class Meta:
        model = models.CustomUser

    email = factory.Sequence(lambda n: f"user{n}@example.com")
    is_staff = False
    is_active = True

    @factory.post_generation
    def password(obj, create, extracted, **kwargs):
        raw_password = extracted or "password123"
        obj.set_password(raw_password)
        if create:
            obj.save(update_fields=["password"])


class PrivacyMetadataFactory(DjangoModelFactory):
    class Meta:
        model = models.PrivacyMetadata

    visibility = factory.Iterator(["public", "private"])


class AgeFactory(DjangoModelFactory):
    class Meta:
        model = models.Age

    user = factory.SubFactory(CustomUserFactory)
    privacy_metadata = factory.SubFactory(PrivacyMetadataFactory)
    birth_date = factory.Faker("date_of_birth", minimum_age=18, maximum_age=90)


class PlaceOfBirthFactory(DjangoModelFactory):
    class Meta:
        model = models.PlaceOfBirth

    user = factory.SubFactory(CustomUserFactory)
    privacy_metadata = factory.SubFactory(PrivacyMetadataFactory)
    birth_country = factory.Iterator(["GB", "US", "PT", "BR", "DE", "ES"])
    birth_state = factory.Faker("state")
    birth_city = factory.Faker("city")


class AddressFactory(DjangoModelFactory):
    class Meta:
        model = models.Address

    user = factory.SubFactory(CustomUserFactory)
    privacy_metadata = factory.SubFactory(PrivacyMetadataFactory)
    address_type = factory.Iterator(["home", "work", "mailing"])
    resident_country = factory.Iterator(["GB", "US", "PT", "BR", "DE", "ES"])
    resident_state = factory.Faker("state")
    resident_city = factory.Faker("city")
    resident_postal_code = factory.Faker("postcode")
    resident_street = factory.Faker("street_name")
    resident_house_number = factory.Faker("building_number")


class GenderFactory(DjangoModelFactory):
    class Meta:
        model = models.Gender

    user = factory.SubFactory(CustomUserFactory)
    privacy_metadata = factory.SubFactory(PrivacyMetadataFactory)
    gender = factory.Iterator(["male", "female", "non-binary", "prefer_not_to_say"])


class NationalityFactory(DjangoModelFactory):
    class Meta:
        model = models.Nationality

    user = factory.SubFactory(CustomUserFactory)
    privacy_metadata = factory.SubFactory(PrivacyMetadataFactory)
    nationality = factory.Iterator(["GB", "US", "PT", "BR", "DE", "ES"])


class AccessLogFactory(DjangoModelFactory):
    class Meta:
        model = models.AccessLog

    user = factory.SubFactory(CustomUserFactory)
    relying_party = factory.Faker("company")


class CredentialFactory(DjangoModelFactory):
    class Meta:
        model = models.Credential

    user = factory.SubFactory(CustomUserFactory)
    privacy_metadata = factory.SubFactory(PrivacyMetadataFactory)
    credential_name = factory.Iterator(
        ["Passport", "Driver License", "National ID", "Student ID"]
    )
    credential_type = factory.Iterator(["government", "education", "employment"])
    credential_description = factory.Faker("paragraph", nb_sentences=3)
    credential_id = factory.Sequence(lambda n: f"CRED-{n:08d}")
    issuing_authority = factory.Faker("company")
    issuance_date = factory.Faker("date_between", start_date="-10y", end_date="-1y")
    expiry_date = factory.Faker("date_between", start_date="+1y", end_date="+10y")
    credential_url = factory.Faker("url")


class LegalIdentityFactory(DjangoModelFactory):
    class Meta:
        model = models.LegalIdentity

    user = factory.SubFactory(CustomUserFactory)
    privacy_metadata = factory.SubFactory(PrivacyMetadataFactory)
    family_name = factory.Faker("last_name")
    middle_name = factory.Faker("first_name")
    given_name = factory.Faker("first_name")
    family_name_birth = factory.Faker("last_name")
    given_name_birth = factory.Faker("first_name")


class ProfessionalIdentityFactory(DjangoModelFactory):
    class Meta:
        model = models.ProfessionalIdentity

    user = factory.SubFactory(CustomUserFactory)
    privacy_metadata = factory.SubFactory(PrivacyMetadataFactory)
    job_title = factory.Faker("job")
    role_description = factory.Faker("sentence", nb_words=12)
    employee_number = factory.Sequence(lambda n: f"EMP-{n:06d}")


class OnlineProfileFactory(DjangoModelFactory):
    class Meta:
        model = models.OnlineProfile

    user = factory.SubFactory(CustomUserFactory)
    privacy_metadata = factory.SubFactory(PrivacyMetadataFactory)
    platform = factory.Iterator(["github", "linkedin", "x", "instagram"])
    username = factory.Faker("user_name")
    display_name = factory.Faker("name")
    extra_fields = factory.LazyFunction(lambda: {"followers": random.randint(0, 10000)})  # nosec B311


class PseudonymFactory(DjangoModelFactory):
    class Meta:
        model = models.Pseudonym

    user = factory.SubFactory(CustomUserFactory)
    privacy_metadata = factory.SubFactory(PrivacyMetadataFactory)
    relying_party = factory.Faker("company")
    pseudonym_value = factory.Faker("user_name")
    is_active = True


class DailyUseFactory(DjangoModelFactory):
    class Meta:
        model = models.DailyUse

    user = factory.SubFactory(CustomUserFactory)
    privacy_metadata = factory.SubFactory(PrivacyMetadataFactory)
    preferred_name = factory.Faker("first_name")
    nickname = factory.Faker("first_name")


class CustomObjectFactory(DjangoModelFactory):
    class Meta:
        model = models.CustomObject

    user = factory.SubFactory(CustomUserFactory)
    privacy_metadata = factory.SubFactory(PrivacyMetadataFactory)
    name_type = factory.Iterator(["employee_id", "student_number", "membership_id"])
    name_value = factory.Sequence(lambda n: f"VAL-{n:08d}")

    @classmethod
    def _create(cls, model_class, *args, **kwargs):
        obj = model_class(*args, **kwargs)
        obj.full_clean()
        obj.save()
        return obj


class NameHistoryFactory(DjangoModelFactory):
    class Meta:
        model = models.NameHistory

    user = factory.SubFactory(CustomUserFactory)
    privacy_metadata = factory.SubFactory(PrivacyMetadataFactory)
    family_name = factory.Faker("last_name")
    middle_name = factory.Faker("first_name")
    given_name = factory.Faker("first_name")
    valid_from = factory.LazyFunction(lambda: timezone.now() - timedelta(days=730))
    valid_until = factory.LazyFunction(lambda: timezone.now() - timedelta(days=30))
