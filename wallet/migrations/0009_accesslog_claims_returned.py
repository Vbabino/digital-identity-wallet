from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("wallet", "0008_privacymetadata_visibility_choices"),
    ]

    operations = [
        migrations.AddField(
            model_name="accesslog",
            name="claims_returned",
            field=models.JSONField(blank=True, default=list),
        ),
    ]
