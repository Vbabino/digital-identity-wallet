from django.db import migrations, models


def convert_to_valid_values(apps, schema_editor):
    PrivacyMetadata = apps.get_model("wallet", "PrivacyMetadata")
    # Clamp "restricted" and any unknown values to "private"
    PrivacyMetadata.objects.exclude(visibility__in=["public", "private"]).update(
        visibility="private"
    )


class Migration(migrations.Migration):
    dependencies = [
        ("wallet", "0007_accesslog_application_accesslog_scopes_accessed"),
    ]

    operations = [
        migrations.RunPython(convert_to_valid_values, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="privacymetadata",
            name="visibility",
            field=models.CharField(
                choices=[("public", "Public"), ("private", "Private")],
                default="public",
                max_length=10,
            ),
        ),
    ]
