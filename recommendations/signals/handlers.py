# from django.dispatch import Signal
from django.dispatch import receiver
from django.db.models.signals import post_save

from recommendations.models import GHUser
from recommendations.tasks import cltask_user_starred_repositories

# user_registered = Signal(providing_args=["username", "github_url"])

# def get_starred_repositories_handler(sender, username, github_url, **kwargs):
#     cltask_user_starred_repositories(username, github_url)

@receiver(post_save, sender=GHUser)
def get_starred_repositories_handler(sender, instance, **kwargs):
    if kwargs["created"]:
        # cltask_user_starred_repositories.delay(instance.username, instance.github_username)
        cltask_user_starred_repositories(instance.username, instance.github_username)