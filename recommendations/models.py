from django.db import models


class GHRepository(models.Model):
    url = models.URLField(max_length=2100, unique=True)
    name = models.CharField(max_length=255)
    owner = models.CharField(max_length=255)
    description = models.TextField(null=True, default=None)
    num_stars = models.IntegerField()

    class Meta:
        ordering = ["name"]


class GHUser(models.Model):
    username = models.CharField(max_length=255, unique=True)
    github_username = models.CharField(max_length=255)
    last_reps_update = models.DateTimeField(null=True)
    repositories = models.ManyToManyField(GHRepository, related_name="users")
    retrieve_reps_task_id = models.UUIDField(null=True)


class GHRepositoryGroup(models.Model):
    class RecommendationsStatus(models.TextChoices):
        NOT_STARTED = "N"
        IN_PROGRESS = "P"
        COMPLETED = "C"

    name = models.CharField(max_length=255)
    user = models.ForeignKey(GHUser, on_delete=models.CASCADE, related_name="groups")
    repositories = models.ManyToManyField(GHRepository, related_name="groups")
    created_at = models.DateTimeField(auto_now_add=True)
    recommendations_status = models.CharField(
        max_length=1,
        choices=RecommendationsStatus.choices,
        default=RecommendationsStatus.NOT_STARTED,
    )
    get_recs_task_id = models.UUIDField(null=True)
    recommended_repositories = models.ManyToManyField(
        GHRepository, through="GHRecommendedRepository"
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["name", "user"], name="unique_name_user_combination"
            )
        ]
        ordering = ["-created_at"]


class GHRecommendedRepository(models.Model):
    repository = models.ForeignKey(GHRepository, on_delete=models.CASCADE)
    group = models.ForeignKey(GHRepositoryGroup, on_delete=models.CASCADE)
    num_of_hits = models.IntegerField()

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["repository", "group"], name="unique_rep_group_combination"
            )
        ]
        ordering = ["-num_of_hits"]
