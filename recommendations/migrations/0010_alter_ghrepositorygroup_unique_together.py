# Generated by Django 4.1.6 on 2023-09-11 13:15

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('recommendations', '0009_remove_ghrepositorygroup_creation_date_and_more'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='ghrepositorygroup',
            unique_together={('name', 'user')},
        ),
    ]