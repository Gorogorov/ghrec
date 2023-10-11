from rest_framework import serializers

from recommendations.models import (
    GHUser,
    GHRepository,
    GHRepositoryGroup,
    GHRecommendedRepository,
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = GHUser
        fields = ("username", "github_username")


class DynamicRepositorySerializer(serializers.ModelSerializer):
    def __init__(self, *args, **kwargs):
        fields = kwargs.pop("fields", None)
        super().__init__(*args, **kwargs)

        if fields is not None:
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)

    class Meta:
        model = GHRepository
        fields = ("name", "description", "url", "num_stars")


class RepositoryGroupSerializer(serializers.ModelSerializer):
    name = serializers.CharField(min_length=1, max_length=255)
    repositories_url = serializers.ListField(
        child=serializers.URLField(min_length=1, max_length=2100), write_only=True
    )
    repositories = DynamicRepositorySerializer(
        many=True, fields=["name", "url"], read_only=True
    )

    def validate_name(self, name):
        auth_username = self.context["request"].user.username
        ghuser = GHUser.objects.get(username=auth_username)

        if GHRepositoryGroup.objects.filter(name=name, user=ghuser).exists():
            if not self.instance or self.instance and name != self.instance.name:
                raise serializers.ValidationError(
                    "Group with this name already exists for the user."
                )
        return name

    def validate_repositories_url(self, repositories_url):
        auth_username = self.context["request"].user.username
        ghuser = GHUser.objects.get(username=auth_username)

        if len(repositories_url) != len(set(repositories_url)):
            raise serializers.ValidationError("Urls should be unique.")

        repositories = GHRepository.objects.filter(
            url__in=repositories_url, users=ghuser
        )
        if len(repositories) != len(repositories_url):
            raise serializers.ValidationError(
                "At least one of the urls doesn't "
                "have corresponding repository in the "
                "repositories list of the user."
            )
        return repositories_url

    def create(self, validated_data):
        # convert auth model to ghuser model
        auth_username = self.context["request"].user.username
        ghuser = GHUser.objects.get(username=auth_username)

        ghgroup = GHRepositoryGroup.objects.create(
            name=validated_data["name"], user=ghuser
        )
        repositories = GHRepository.objects.filter(
            url__in=validated_data["repositories_url"]
        )
        ghgroup.repositories.set(repositories)

        ghgroup.save()
        return ghgroup

    def update(self, instance, validated_data):
        instance.name = validated_data.get("name", instance.name)

        repositories = GHRepository.objects.filter(
            url__in=validated_data["repositories_url"]
        )
        instance.repositories.set(repositories)

        instance.save()
        return instance

    class Meta:
        model = GHRepositoryGroup
        fields = (
            "name",
            "repositories",
            "created_at",
            "recommendations_status",
            "repositories_url",
        )
        read_only_fields = ("created_at", "recommendations_status")


class RecommendedRepositorySerializer(serializers.ModelSerializer):
    repository = DynamicRepositorySerializer()

    class Meta:
        model = GHRecommendedRepository
        fields = ("repository", "num_of_hits")
