import logging

from django.dispatch import receiver
from django.db.models.signals import post_save

from recommendations.models import GHUser
from recommendations.tasks import cltask_user_starred_repositories


logger = logging.getLogger(__name__)


@receiver(post_save, sender=GHUser)
def get_starred_repositories_handler(sender, instance, **kwargs):
    if kwargs["created"]:
        # cltask_user_starred_repositories.delay(instance.username, instance.github_username)
        task_result = cltask_user_starred_repositories(
            instance.username, instance.github_username
        )
        logger.info(
            "Celery task submitted, "
            "name: cltask_user_starred_repositories, "
            f"task_id {task_result}"
        )
