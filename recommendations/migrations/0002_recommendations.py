# Generated by Django 4.1.6 on 2023-02-24 11:52

from django.db import migrations


def create_data(apps, schema_editor):
    Customer = apps.get_model("recommendations", "Customer")
    Customer(
        first_name="Customer 001",
        last_name="Customer 001",
        email="customer001@email.com",
        phone="00000000",
        address="Customer 000 Address",
        description="Customer 001 description",
    ).save()


class Migration(migrations.Migration):
    dependencies = [
        ("recommendations", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(create_data),
    ]
