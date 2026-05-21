from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status, viewsets
from drf_spectacular.utils import extend_schema

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
from .serializers import (
    AddressSerializer,
    DateOfBirthSerializer,
    GenderSerializer,
    LegalIdentitySerializer,
    PlaceOfBirthSerializer,
    NationalitySerializer,
    CredentialSerializer,
    ProfessionalIdentitySerializer,
    OnlineProfileSerializer,
    PseudonymSerializer,
    DailyUseSerializer,
    CustomObjectSerializer,
    NameHistorySerializer,
    AccessLogSerializer,
)


class DateOfBirthView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_date_of_birth(self, user):
        try:
            return user.age
        except Age.DoesNotExist:
            return None

    @extend_schema(responses=DateOfBirthSerializer)
    def get(self, request):
        date_of_birth = self._get_date_of_birth(request.user)
        if date_of_birth is None:
            return Response(
                {"detail": "Date of Birth record not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(DateOfBirthSerializer(date_of_birth).data)

    @extend_schema(request=DateOfBirthSerializer, responses=DateOfBirthSerializer)
    def post(self, request):
        if self._get_date_of_birth(request.user) is not None:
            return Response(
                {"detail": "Date of Birth record already exists. Use PATCH to update."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = DateOfBirthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        privacy = PrivacyMetadata.objects.create(
            visibility=request.data.get("visibility", PrivacyMetadata.PUBLIC)
        )
        serializer.save(user=request.user, privacy_metadata=privacy)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @extend_schema(request=DateOfBirthSerializer, responses=DateOfBirthSerializer)
    def put(self, request):
        return self._update(request, partial=False)

    @extend_schema(request=DateOfBirthSerializer, responses=DateOfBirthSerializer)
    def patch(self, request):
        return self._update(request, partial=True)

    def _update(self, request, partial):
        date_of_birth = self._get_date_of_birth(request.user)
        if date_of_birth is None:
            return Response(
                {"detail": "Date of Birth record not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = DateOfBirthSerializer(
            date_of_birth, data=request.data, partial=partial
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class PlaceOfBirthView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_place_of_birth(self, user):
        try:
            return user.place_of_birth
        except PlaceOfBirth.DoesNotExist:
            return None

    @extend_schema(responses=PlaceOfBirthSerializer)
    def get(self, request):
        place_of_birth = self._get_place_of_birth(request.user)
        if place_of_birth is None:
            return Response(
                {"detail": "Place of Birth record not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(PlaceOfBirthSerializer(place_of_birth).data)

    @extend_schema(request=PlaceOfBirthSerializer, responses=PlaceOfBirthSerializer)
    def post(self, request):
        if self._get_place_of_birth(request.user) is not None:
            return Response(
                {
                    "detail": "Place of Birth record already exists. Use PATCH to update."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = PlaceOfBirthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        privacy = PrivacyMetadata.objects.create(
            visibility=request.data.get("visibility", PrivacyMetadata.PUBLIC)
        )
        serializer.save(user=request.user, privacy_metadata=privacy)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @extend_schema(request=PlaceOfBirthSerializer, responses=PlaceOfBirthSerializer)
    def put(self, request):
        return self._update(request, partial=False)

    @extend_schema(request=PlaceOfBirthSerializer, responses=PlaceOfBirthSerializer)
    def patch(self, request):
        return self._update(request, partial=True)

    def _update(self, request, partial):
        place_of_birth = self._get_place_of_birth(request.user)
        if place_of_birth is None:
            return Response(
                {"detail": "Place of Birth record not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = PlaceOfBirthSerializer(
            place_of_birth, data=request.data, partial=partial
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class LegalIdentityView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_legal_identity(self, user):
        try:
            return user.legal_identity
        except LegalIdentity.DoesNotExist:
            return None

    @extend_schema(responses=LegalIdentitySerializer)
    def get(self, request):
        legal_identity = self._get_legal_identity(request.user)
        if legal_identity is None:
            return Response(
                {"detail": "Legal Identity record not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(LegalIdentitySerializer(legal_identity).data)

    @extend_schema(request=LegalIdentitySerializer, responses=LegalIdentitySerializer)
    def post(self, request):
        if self._get_legal_identity(request.user) is not None:
            return Response(
                {
                    "detail": "Legal Identity record already exists. Use PATCH to update."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = LegalIdentitySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        privacy = PrivacyMetadata.objects.create(
            visibility=request.data.get("visibility", PrivacyMetadata.PUBLIC)
        )
        serializer.save(user=request.user, privacy_metadata=privacy)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @extend_schema(request=LegalIdentitySerializer, responses=LegalIdentitySerializer)
    def put(self, request):
        return self._update(request, partial=False)

    @extend_schema(request=LegalIdentitySerializer, responses=LegalIdentitySerializer)
    def patch(self, request):
        return self._update(request, partial=True)

    def _update(self, request, partial):
        legal_identity = self._get_legal_identity(request.user)
        if legal_identity is None:
            return Response(
                {"detail": "Legal Identity record not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = LegalIdentitySerializer(
            legal_identity, data=request.data, partial=partial
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class UserScopedModelViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AddressView(UserScopedModelViewSet):
    serializer_class = AddressSerializer

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)


class GenderView(UserScopedModelViewSet):
    serializer_class = GenderSerializer

    def get_queryset(self):
        return Gender.objects.filter(user=self.request.user)


class NationalityView(UserScopedModelViewSet):
    serializer_class = NationalitySerializer

    def get_queryset(self):
        return Nationality.objects.filter(user=self.request.user)


class CredentialView(UserScopedModelViewSet):
    serializer_class = CredentialSerializer

    def get_queryset(self):
        return Credential.objects.filter(user=self.request.user)


class ProfessionalIdentityView(UserScopedModelViewSet):
    serializer_class = ProfessionalIdentitySerializer

    def get_queryset(self):
        return ProfessionalIdentity.objects.filter(user=self.request.user)


class OnlineProfileView(UserScopedModelViewSet):
    serializer_class = OnlineProfileSerializer

    def get_queryset(self):
        return OnlineProfile.objects.filter(user=self.request.user)


class PseudonymView(UserScopedModelViewSet):
    serializer_class = PseudonymSerializer

    def get_queryset(self):
        return Pseudonym.objects.filter(user=self.request.user)


class DailyUseView(UserScopedModelViewSet):
    serializer_class = DailyUseSerializer

    def get_queryset(self):
        return DailyUse.objects.filter(user=self.request.user)


class CustomObjectView(UserScopedModelViewSet):
    serializer_class = CustomObjectSerializer

    def get_queryset(self):
        return CustomObject.objects.filter(user=self.request.user)


class NameHistoryView(UserScopedModelViewSet):
    serializer_class = NameHistorySerializer

    def get_queryset(self):
        return NameHistory.objects.filter(user=self.request.user)


class AccessLogView(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = AccessLogSerializer

    def get_queryset(self):
        return AccessLog.objects.filter(user=self.request.user).order_by("-access_time")
