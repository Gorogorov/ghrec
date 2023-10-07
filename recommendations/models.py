from django.db import models


class Customer(models.Model):
    first_name = models.CharField("First name", max_length=255)
    last_name = models.CharField("Last name", max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    address = models.TextField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField("Created At", auto_now_add=True)

    def __str__(self):
        return self.first_name


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
                fields=["repository", "group"],
                name="unique_rep_group_combination"
            )
        ]
        ordering = ["-num_of_hits"]
