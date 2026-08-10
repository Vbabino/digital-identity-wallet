from django.core.cache import cache
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from .models import CustomObject
from .scopes_backend import SCOPES_CACHE_KEY


@receiver(post_save, sender=CustomObject)
@receiver(post_delete, sender=CustomObject)
def invalidate_dynamic_scopes_cache(sender, **kwargs):
    cache.delete(SCOPES_CACHE_KEY)
