# Generated by Django 4.1.6 on 2023-09-11 14:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('recommendations', '0011_ghrepositorygroup_recommended_repositories'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='ghrepositorygroup',
            unique_together=set(),
        ),
        migrations.AddConstraint(
            model_name='ghrepositorygroup',
            constraint=models.UniqueConstraint(fields=('name', 'user'), name='unique_name_user_combination'),
        ),
    ]
