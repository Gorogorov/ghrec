import os

# from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application
from django.urls import path


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "github_rec_theme.settings")

django_asgi_app = get_asgi_application()

from recommendations.consumers import ProgressConsumer
from recommendations.ws_auth_middleware import TokenAuthMiddleware

application = ProtocolTypeRouter({
    "websocket": #AllowedHostsOriginValidator(
        TokenAuthMiddleware(
            URLRouter([
                path(
                    "api/user/groups/<str:group_name>/recommendations/progress/",
                    ProgressConsumer.as_asgi(),
                ),
            ])
        )
    #),
})