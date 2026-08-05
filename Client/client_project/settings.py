from pathlib import Path
import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv(
    "DJANGO_SECRET_KEY", "client-dev-insecure-key-change-in-production"
)
DEBUG = os.getenv("DEBUG", "True") == "True"
ALLOWED_HOSTS = [
    h.strip()
    for h in os.getenv("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")
    if h.strip()
]

if not DEBUG:
    # TLS terminates at the host Nginx reverse proxy, not this container —
    # trust the X-Forwarded-Proto header it sets so request.is_secure() (and
    # therefore CSRF's Origin check) reflects the real scheme. Without this,
    # Django thinks every request is plain HTTP and rejects the browser's
    # "https://..." Origin header on every POST, e.g. the /authorize/ form
    # submission on wallet-demo.gbcode.dev, with a CSRF 403.
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

INSTALLED_APPS = [
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.staticfiles",
    "simulator",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "client_project.urls"
WSGI_APPLICATION = "client_project.wsgi.application"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
            ],
        },
    },
]

# SQLITE_DATA_DIR lets docker-compose point the DB file at a named volume
# (e.g. /app/data) so it survives container recreation; defaults to BASE_DIR
# for local/dev use where no volume is mounted.
SQLITE_DATA_DIR = Path(os.getenv("SQLITE_DATA_DIR", BASE_DIR))

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": SQLITE_DATA_DIR / "db.sqlite3",
    }
}

SESSION_ENGINE = "django.contrib.sessions.backends.db"
SESSION_COOKIE_NAME = "simulator_sessionid"

# OAuth2 client credentials — loaded from .env
WALLET_CLIENT_ID = os.getenv("CLIENT_ID")
WALLET_CLIENT_SECRET = os.getenv("CLIENT_SECRET")
WALLET_BASE_URL = os.getenv("WALLET_BASE_URL", "http://localhost:8000")
CLIENT_REDIRECT_URI = os.getenv(
    "CLIENT_REDIRECT_URI", "http://localhost:8001/callback/"
)

STATIC_URL = "/static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
