"""
Settings used ONLY for `collectstatic` during `docker build`. No database is
available and no real secrets exist yet at build time — this module provides
just enough (STATIC_ROOT + WhiteNoise storage) for collectstatic to run,
without production.py's fail-fast checks that would otherwise force fake
"placeholder" secrets into Dockerfile ARGs (a real risk: ARG values are
visible forever in `docker history`, so anything shaped like a secret
shouldn't be passable as one, even as a placeholder).

Never use this module outside the build step — it has no SECURE_*/HSTS
hardening and DEBUG defaults are inherited unset like base.py.
"""

from .base import *  # noqa: F401,F403
from .base import BASE_DIR
from .base import MIDDLEWARE as BASE_MIDDLEWARE

DEBUG = False
ALLOWED_HOSTS = []

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
