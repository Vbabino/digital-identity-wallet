"""
Development settings — the zero-config default (DJANGO_SETTINGS_MODULE
falls back to this module when unset).
"""

import os

from .base import *  # noqa: F401,F403
from .base import BASE_DIR

# SECURITY WARNING: this fallback key is for local development convenience
# — production.py requires DJANGO_SECRET_KEY to be set explicitly.
SECRET_KEY = os.getenv(
    "DJANGO_SECRET_KEY", "django-insecure-dev-only-not-for-production"
)

DEBUG = True

ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# MailHog-style local SMTP catcher (docker run -p 1025:1025 -p 8025:8025 mailhog/mailhog).
# Falls back to the console backend if MailHog isn't running and EMAIL_BACKEND
# isn't overridden in .env.
EMAIL_BACKEND = os.getenv(
    "EMAIL_BACKEND", "django.core.mail.backends.console.EmailBackend"
)
EMAIL_HOST = "0.0.0.0"  # nosec B104
EMAIL_PORT = 1025
EMAIL_HOST_USER = ""
EMAIL_HOST_PASSWORD = ""  # nosec B105
EMAIL_USE_TLS = False
