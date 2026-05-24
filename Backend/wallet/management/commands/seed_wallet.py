from django.core.management.base import BaseCommand
from django.db import transaction

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


class Command(BaseCommand):
    help = "Seed wallet app models with fake data for local API testing."

    def add_arguments(self, parser):
        parser.add_argument(
            "--users",
            type=int,
            default=10,
            help="Number of users to create (default: 10).",
        )
        parser.add_argument(
            "--per-user",
            type=int,
            default=2,
            help="How many records to create per FK-based model, per user (default: 2).",
        )
        parser.add_argument(
            "--password",
            type=str,
            default="password123",
            help="Password to set on seeded users (default: password123).",
        )
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete existing wallet model records before seeding.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        users_count = max(0, options["users"])
        per_user_count = max(0, options["per_user"])
        password = options["password"]
        should_clear = options["clear"]

        if should_clear:
            self._clear_wallet_data()
            self.stdout.write(self.style.WARNING("Existing wallet data deleted."))

        created = {
            "users": 0,
            "privacy_metadata": 0,
            "age": 0,
            "place_of_birth": 0,
            "legal_identity": 0,
            "addresses": 0,
            "genders": 0,
            "nationalities": 0,
            "credentials": 0,
            "professional_identities": 0,
            "online_profiles": 0,
            "pseudonyms": 0,
            "daily_uses": 0,
            "custom_objects": 0,
            "name_histories": 0,
            "access_logs": 0,
        }

        for _ in range(users_count):
            user = CustomUserFactory(password=password)
            created["users"] += 1

            privacy = PrivacyMetadataFactory()
            created["privacy_metadata"] += 1

            AgeFactory(user=user, privacy_metadata=privacy)
            created["age"] += 1

            PlaceOfBirthFactory(user=user, privacy_metadata=privacy)
            created["place_of_birth"] += 1

            LegalIdentityFactory(user=user, privacy_metadata=privacy)
            created["legal_identity"] += 1

            for _ in range(per_user_count):
                AddressFactory(user=user, privacy_metadata=privacy)
                created["addresses"] += 1

                GenderFactory(user=user, privacy_metadata=privacy)
                created["genders"] += 1

                NationalityFactory(user=user, privacy_metadata=privacy)
                created["nationalities"] += 1

                CredentialFactory(user=user, privacy_metadata=privacy)
                created["credentials"] += 1

                ProfessionalIdentityFactory(user=user, privacy_metadata=privacy)
                created["professional_identities"] += 1

                OnlineProfileFactory(user=user, privacy_metadata=privacy)
                created["online_profiles"] += 1

                PseudonymFactory(user=user, privacy_metadata=privacy)
                created["pseudonyms"] += 1

                DailyUseFactory(user=user, privacy_metadata=privacy)
                created["daily_uses"] += 1

                CustomObjectFactory(user=user, privacy_metadata=privacy)
                created["custom_objects"] += 1

                NameHistoryFactory(user=user, privacy_metadata=privacy)
                created["name_histories"] += 1

                AccessLogFactory(user=user)
                created["access_logs"] += 1

        self.stdout.write(self.style.SUCCESS("Seeding completed successfully."))
        for label, count in created.items():
            self.stdout.write(f"- {label}: {count}")

    def _clear_wallet_data(self):
        models.AccessLog.objects.all().delete()
        models.NameHistory.objects.all().delete()
        models.CustomObject.objects.all().delete()
        models.DailyUse.objects.all().delete()
        models.Pseudonym.objects.all().delete()
        models.OnlineProfile.objects.all().delete()
        models.ProfessionalIdentity.objects.all().delete()
        models.LegalIdentity.objects.all().delete()
        models.Credential.objects.all().delete()
        models.Nationality.objects.all().delete()
        models.Gender.objects.all().delete()
        models.Address.objects.all().delete()
        models.PlaceOfBirth.objects.all().delete()
        models.Age.objects.all().delete()
        models.PrivacyMetadata.objects.all().delete()
        models.CustomUser.objects.all().delete()
