# Generated by Django 4.1.6 on 2023-10-04 17:43

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        (
            "recommendations",
            "0015_ghrecommendedrepository_unique_rep_group_combination",
        ),
    ]

    operations = [
        migrations.RemoveField(
            model_name="ghrepository",
            name="id",
        ),
        migrations.AlterField(
            model_name="ghrepository",
            name="url",
            field=models.URLField(max_length=2100, primary_key=True, serialize=False),
        ),
    ]
