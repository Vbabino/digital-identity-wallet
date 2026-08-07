from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status, viewsets
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework.pagination import PageNumberPagination

from .export_service import WalletExportError, export_wallet_data_to_json
from .models import (
    Age,
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


class UserSingletonAPIView(APIView):
    permission_classes = [IsAuthenticated]
    model_class = None
    serializer_class = None
    related_name = None
    display_name = None

    def _get_instance(self, user):
        try:
            return getattr(user, self.related_name)
        except self.model_class.DoesNotExist:
            return None

    def get(self, request):
        instance = self._get_instance(request.user)
        if instance is None:
            return Response(
                {"detail": f"{self.display_name} record not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(self.serializer_class(instance).data)

    def post(self, request):
        if self._get_instance(request.user) is not None:
            return Response(
                {
                    "detail": f"{self.display_name} record already exists. Use PATCH to update."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def put(self, request):
        return self._update(request, partial=False)

    def patch(self, request):
        return self._update(request, partial=True)

    def _update(self, request, partial):
        instance = self._get_instance(request.user)
        if instance is None:
            return Response(
                {"detail": f"{self.display_name} record not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = self.serializer_class(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


@extend_schema_view(
    get=extend_schema(responses=DateOfBirthSerializer),
    post=extend_schema(request=DateOfBirthSerializer, responses=DateOfBirthSerializer),
    put=extend_schema(request=DateOfBirthSerializer, responses=DateOfBirthSerializer),
    patch=extend_schema(request=DateOfBirthSerializer, responses=DateOfBirthSerializer),
)
class DateOfBirthView(UserSingletonAPIView):
    model_class = Age
    serializer_class = DateOfBirthSerializer
    related_name = "age"
    display_name = "Date of Birth"


@extend_schema_view(
    get=extend_schema(responses=PlaceOfBirthSerializer),
    post=extend_schema(
        request=PlaceOfBirthSerializer, responses=PlaceOfBirthSerializer
    ),
    put=extend_schema(request=PlaceOfBirthSerializer, responses=PlaceOfBirthSerializer),
    patch=extend_schema(
        request=PlaceOfBirthSerializer, responses=PlaceOfBirthSerializer
    ),
)
class PlaceOfBirthView(UserSingletonAPIView):
    model_class = PlaceOfBirth
    serializer_class = PlaceOfBirthSerializer
    related_name = "place_of_birth"
    display_name = "Place of Birth"


@extend_schema_view(
    get=extend_schema(responses=LegalIdentitySerializer),
    post=extend_schema(
        request=LegalIdentitySerializer, responses=LegalIdentitySerializer
    ),
    put=extend_schema(
        request=LegalIdentitySerializer, responses=LegalIdentitySerializer
    ),
    patch=extend_schema(
        request=LegalIdentitySerializer, responses=LegalIdentitySerializer
    ),
)
class LegalIdentityView(UserSingletonAPIView):
    model_class = LegalIdentity
    serializer_class = LegalIdentitySerializer
    related_name = "legal_identity"
    display_name = "Legal Identity"


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


class NameHistoryPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "size"
    max_page_size = 10


class NameHistoryView(UserScopedModelViewSet):
    serializer_class = NameHistorySerializer
    pagination_class = NameHistoryPagination

    def get_queryset(self):
        return NameHistory.objects.filter(user=self.request.user).order_by("-valid_from")


class AccessLogPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "size"
    max_page_size = 10


class AccessLogView(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = AccessLogSerializer
    pagination_class = AccessLogPagination

    def get_queryset(self):
        return AccessLog.objects.filter(user=self.request.user).order_by("-access_time")


class WalletExportView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses={200: {"type": "object"}})
    def get(self, request):
        try:
            json_string = export_wallet_data_to_json(request.user)
        except WalletExportError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        response = HttpResponse(json_string, content_type="application/json")
        response["Content-Disposition"] = 'attachment; filename="wallet_export.json"'
        return response
