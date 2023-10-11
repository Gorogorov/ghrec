from django.test import TestCase

from recommendations.tasks import cltask_user_starred_repositories
from recommendations.models import GHUser, GHRepository


class GHUserStarredRepositories(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_authorized_username = "testuser"
        cls.test_authorized_github_username = "gorogorov"
        test_authorized_user = GHUser(
            username=cls.test_authorized_username,
            github_username=cls.test_authorized_github_username,
        )
        test_authorized_user.save()

    def test_github_call(self):
        cltask_user_starred_repositories(
            self.test_authorized_username, self.test_authorized_github_username
        )
        print(GHRepository.objects.all().values())
