from datetime import datetime
import pytz

from django.contrib.auth.models import AnonymousUser
from rest_framework.authtoken.models import Token
from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware

from django.conf import settings


@database_sync_to_async
def get_user(token_key):
    try:
        token = Token.objects.get(key=token_key)
    except Token.DoesNotExist:
        return AnonymousUser()
    
    if not token.user.is_active:
        return AnonymousUser()

    utc_now = datetime.utcnow()
    utc_now = utc_now.replace(tzinfo=pytz.utc)

    if token.created < utc_now - settings.WS_AUTH["TOKEN_LIFETIME"]:
        return AnonymousUser()

    return token.user


class TokenAuthMiddleware(BaseMiddleware):
    def __init__(self, inner):
        super().__init__(inner)

    async def __call__(self, scope, receive, send):
        try:
            token_key = (dict((x.split('=') for x in scope['query_string'].decode().split("&")))).get('token', None)
        except ValueError:
            token_key = None

        scope['user'] = AnonymousUser() if token_key is None else await get_user(token_key)
        return await super().__call__(scope, receive, send)