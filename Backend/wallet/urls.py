from django.urls import path
from rest_framework import routers
from .views import (
    DateOfBirthView,
    PlaceOfBirthView,
    LegalIdentityView,
    AddressView,
    GenderView,
    NationalityView,
    CredentialView,
    ProfessionalIdentityView,
    OnlineProfileView,
    PseudonymView,
    DailyUseView,
    CustomObjectView,
    NameHistoryView,
    AccessLogView,
    WalletExportView,
    CountriesView,
)

router = routers.SimpleRouter()
router.register(r"addresses", AddressView, basename="addresses")
router.register(r"gender", GenderView, basename="gender")
router.register(r"nationalities", NationalityView, basename="nationalities")
router.register(r"credentials", CredentialView, basename="credentials")
router.register(r"professionals", ProfessionalIdentityView, basename="professionals")
router.register(r"online-profiles", OnlineProfileView, basename="online-profiles")
router.register(r"pseudonyms", PseudonymView, basename="pseudonyms")
router.register(r"daily-uses", DailyUseView, basename="daily-uses")
router.register(r"custom-objects", CustomObjectView, basename="custom-objects")
router.register(r"name-histories", NameHistoryView, basename="name-histories")
router.register(r"access-logs", AccessLogView, basename="access-logs")

urlpatterns = [
    path("date-of-birth/", DateOfBirthView.as_view(), name="date-of-birth"),
    path("place-of-birth/", PlaceOfBirthView.as_view(), name="place-of-birth"),
    path("legal-identities/", LegalIdentityView.as_view(), name="legal-identity-list"),
    path("export/", WalletExportView.as_view(), name="wallet-export"),
    path("countries/", CountriesView.as_view(), name="countries"),
] + router.urls
