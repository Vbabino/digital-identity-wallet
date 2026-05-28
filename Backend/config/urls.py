from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from oauth2_provider import urls as oauth2_urls


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path("accounts/", include("allauth.urls")),
    path("o/", include(oauth2_urls)),
    path("api/auth/", include("auth_kit.urls")),
    path("api/auth/social/", include("auth_kit.social.urls")),
    path("api/wallet/", include("wallet.urls")),
]
