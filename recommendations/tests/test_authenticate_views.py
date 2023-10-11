from django.test import TestCase
from django.urls import reverse

from recommendations.models import GHRepository, GHUser


class RegisterViewTests(TestCase):
    def test_register_user(self):
        response = self.client.post(
            reverse("register"),
            {
                "username": "gorogorov",
                "github_username": "gorogorov",
                "password": "qwerty00",
                "email": "gorogorov@redwinds.ru",
            },
        )
        self.assertEqual(response.status_code, 200)
        print(GHRepository.objects.all().values())
        print(GHUser.objects.all().values())
