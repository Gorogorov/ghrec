# Generated by Django 4.1.6 on 2023-08-27 07:32

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("recommendations", "0006_ghrepository_owner"),
    ]

    operations = [
        migrations.AddField(
            model_name="ghrepositorygroup",
            name="creation_date",
            field=models.DateTimeField(null=True),
        ),
    ]
