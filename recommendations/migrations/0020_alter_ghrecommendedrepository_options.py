# Generated by Django 5.0a1 on 2023-12-14 12:06

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("recommendations", "0019_ghrepositorygroup_get_recs_task_id"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="ghrecommendedrepository",
            options={"ordering": ["-num_of_hits", "pk"]},
        ),
    ]
