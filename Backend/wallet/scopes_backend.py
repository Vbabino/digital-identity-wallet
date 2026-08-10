from django.core.cache import cache
from oauth2_provider.scopes import BaseScopes
from .models import CustomObject

SCOPES_CACHE_KEY = "wallet:dynamic_scopes"
# Primary consistency mechanism: LocMemCache is per-process, so the signal-based
# invalidation in signals.py only clears the cache in the worker that handled the
# write. A short TTL helps keep staleness in check across other workers. If this ever needs
# to be strongly consistent across workers, that's the point to move to django-redis.

SCOPES_CACHE_TTL = 60

STATIC_SCOPES = {
    "openid": "OpenID Connect scope",
    "birthdate": "Access to user's birthdate",
    "over_18": "Access to user's over 18 status",
    "place_of_birth": "Access to user's place of birth",
    "address": "Access to user's address",
    "gender": "Access to user's gender",
    "nationality": "Access to user's nationality",
    "credentials": "Access to user's credentials",
    "legal_name": "Access to user's legal name",
    "professional_identity": "Access to user's professional identity",
    "online_profile": "Access to user's online profile",
    "pseudonym": "Access to user's pseudonym",
    "daily_use": "Access to user's daily use names",
}


class DynamicScopesBackend(BaseScopes):
    def get_all_scopes(self):
        cached = cache.get(SCOPES_CACHE_KEY)
        if cached is not None:
            return cached

        scopes = dict(STATIC_SCOPES)
        for name_type in CustomObject.objects.values_list(
            "name_type", flat=True
        ).distinct():
            scope_key = f"custom_name:{name_type}"
            scopes[scope_key] = f"Access to user's {name_type.replace('_', ' ')}"

        cache.set(SCOPES_CACHE_KEY, scopes, SCOPES_CACHE_TTL)
        return scopes

    def get_available_scopes(self, application=None, request=None, *args, **kwargs):
        return list(self.get_all_scopes().keys())

    def get_default_scopes(self, application=None, request=None, *args, **kwargs):
        return ["openid"]
