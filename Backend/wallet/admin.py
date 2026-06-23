from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .forms import CustomUserCreationForm, CustomUserChangeForm
from .models import (
    CustomUser,
    PrivacyMetadata,
    Age,
    PlaceOfBirth,
    Address,
    Gender,
    Nationality,
    AccessLog,
    Credential,
    LegalIdentity,
    ProfessionalIdentity,
    OnlineProfile,
    Pseudonym,
    DailyUse,
    CustomObject,
    NameHistory,
)


class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = CustomUser
    list_display = ("email", "is_staff", "is_active", "created_at")
    list_filter = ("is_staff", "is_active")
    search_fields = ("email",)
    ordering = ("email",)

    # Fieldsets for the user detail page (change form)
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (
            "Permissions",
            {
                "fields": (
                    "is_staff",
                    "is_active",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("Important dates", {"fields": ("last_login", "created_at", "updated_at")}),
    )
    # Fieldsets for the user creation page (add form)
    add_fieldsets = (
        (None, {"classes": ("wide",), "fields": ("email", "password1", "password2")}),
    )
    readonly_fields = ("last_login", "created_at", "updated_at")


# Register your models here
admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(PrivacyMetadata)
admin.site.register(Age)
admin.site.register(PlaceOfBirth)
admin.site.register(Address)
admin.site.register(Gender)
admin.site.register(Nationality)
admin.site.register(AccessLog)
admin.site.register(Credential)
admin.site.register(LegalIdentity)
admin.site.register(ProfessionalIdentity)
admin.site.register(OnlineProfile)
admin.site.register(Pseudonym)
admin.site.register(DailyUse)
admin.site.register(CustomObject)
admin.site.register(NameHistory)
