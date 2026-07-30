"""
Production settings — used only when DJANGO_SETTINGS_MODULE is set
explicitly to config.settings.production (done via the Backend Docker
image's ENV). Fails fast on missing required secrets rather than silently
booting with None/empty values.
"""

import os

import dj_database_url
from django.core.exceptions import ImproperlyConfigured

from .base import *  # noqa: F401,F403
from .base import BASE_DIR
from .base import MIDDLEWARE as BASE_MIDDLEWARE
from .base import OAUTH2_PROVIDER
from .base import SOCIALACCOUNT_PROVIDERS


def _require_env(name):
    value = os.getenv(name)
    if not value:
        raise ImproperlyConfigured(
            f"{name} must be set in the environment for production settings."
        )
    return value


SECRET_KEY = _require_env("DJANGO_SECRET_KEY")

DEBUG = False

ALLOWED_HOSTS = [
    h.strip() for h in _require_env("DJANGO_ALLOWED_HOSTS").split(",") if h.strip()
]

DATABASES = {"default": dj_database_url.config(default=_require_env("DATABASE_URL"))}

# OIDC_ENABLED requires a real RSA private key in production. Reassign into
# the dict explicitly rather than just calling _require_env() for its
# side-effect, so the fail-fast guard stays coupled to the setting it protects.
OAUTH2_PROVIDER["OIDC_RSA_PRIVATE_KEY"] = _require_env("OIDC_RSA_PRIVATE_KEY")

GOOGLE_CLIENT_ID = _require_env("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = _require_env("GOOGLE_CLIENT_SECRET")
SOCIALACCOUNT_PROVIDERS["google"]["APP"]["client_id"] = GOOGLE_CLIENT_ID
SOCIALACCOUNT_PROVIDERS["google"]["APP"]["secret"] = GOOGLE_CLIENT_SECRET

# Transactional SMTP provider (Brevo/Resend/Mailgun/SES/etc — provider-agnostic).
EMAIL_BACKEND = os.getenv(
    "EMAIL_BACKEND", "django.core.mail.backends.smtp.EmailBackend"
)
EMAIL_HOST = os.getenv("EMAIL_HOST")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))  # noqa: PLW1508
EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS", "True") == "True"
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "")  # nosec B105
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", EMAIL_HOST_USER)

# Static files served by WhiteNoise from within the Django/gunicorn process —
# host Nginx just proxies /static/ like any other backend path, no filesystem
# sharing between host and container needed.
STATIC_ROOT = BASE_DIR / "staticfiles"

MIDDLEWARE = BASE_MIDDLEWARE.copy()
MIDDLEWARE.insert(1, "whitenoise.middleware.WhiteNoiseMiddleware")

STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

# TLS terminates at the host Nginx reverse proxy, not gunicorn — trust the
# X-Forwarded-Proto header it sets so Django knows the original request was
# HTTPS (required, otherwise SECURE_SSL_REDIRECT loops forever).
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# base.py's CORS_ALLOWED_ORIGINS / CSRF_TRUSTED_ORIGINS both fall back
# independently to a localhost dev default when their env var is unset. If
# production only sets one of the two, the other would silently keep
# accepting the Vite dev server origin — require both explicitly here.
CORS_ALLOWED_ORIGINS = [
    o.strip() for o in _require_env("CORS_ALLOWED_ORIGINS").split(",") if o.strip()
]
CSRF_TRUSTED_ORIGINS = [
    o.strip() for o in _require_env("CSRF_TRUSTED_ORIGINS").split(",") if o.strip()
]
