from django.apps import AppConfig


class RecommendationsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "recommendations"

    def ready(self):
        from recommendations.signals import handlers

        # handlers.user_registered.connect(handlers.get_starred_repositories_handler)
