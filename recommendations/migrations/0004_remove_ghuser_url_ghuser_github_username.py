# Generated by Django 4.1.6 on 2023-06-29 10:03

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        (
            "recommendations",
            "0003_ghrepository_rename_createdat_customer_created_at_and_more",
        ),
    ]

    operations = [
        migrations.RemoveField(
            model_name="ghuser",
            name="url",
        ),
        migrations.AddField(
            model_name="ghuser",
            name="github_username",
            field=models.CharField(default="gorogorov", max_length=255),
            preserve_default=False,
        ),
    ]
