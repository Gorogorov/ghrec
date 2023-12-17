from datetime import datetime
import pytz
import logging

from rest_framework import status, exceptions
from rest_framework.response import Response
from rest_framework.decorators import (
    api_view,
    permission_classes,
    authentication_classes,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework.authtoken.models import Token
from django.conf import settings
from django.contrib.auth.models import User
from django.db import transaction, IntegrityError

from recommendations.models import GHUser


logger = logging.getLogger(__name__)


class CookieTokenObtainPairView(TokenObtainPairView):
    def initial(self, request, *args, **kwargs):
        try:
            username = request.data.get("username", None)
            if username is None:
                email = request.data.get("email", None)
                user = User.objects.get(email=email)
                username = user.username
                request._mutable = True
                request.data.update({"username": username})
                request._mutable = False
        except:
            raise InvalidToken("Bad credentials")

        return super().initial(request, *args, **kwargs)

    def finalize_response(self, request, response, *args, **kwargs):
        if response.data.get("access"):
            response.set_cookie(
                "access_token",
                response.data["access"],
                max_age=settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"],
                httponly=settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"],
                samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
            )
            del response.data["access"]
        if response.data.get("refresh"):
            response.set_cookie(
                "refresh_token",
                response.data["refresh"],
                max_age=settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"],
                httponly=settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"],
                samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
            )
            del response.data["refresh"]

        return super().finalize_response(request, response, *args, **kwargs)


class CookieTokenRefreshView(TokenRefreshView):
    def initial(self, request, *args, **kwargs):
        if (not hasattr(request, "COOKIES") or 
                "refresh_token" not in request.COOKIES):
            raise InvalidToken("Bad credentials: request "
                                                  "should have "
                                                  "'resfresh_token' "
                                                  "cookie")
        refresh_token = request.COOKIES["refresh_token"]
        request._mutable = True
        request.data.update({"refresh": refresh_token})
        request._mutable = False
        return super().initial(request, *args, **kwargs)

    def finalize_response(self, request, response, *args, **kwargs):
        if not response.data.get("access"):
            error_detail = None
            if isinstance(response.data, dict) and "detail" in response.data:
                error_detail = response.data["detail"]
            if error_detail is None:
                raise exceptions.AuthenticationFailed("Failed generation "
                                                "of JWT access token")
            else:
                logger.warning("JWT access token generation failed with detail: "
                               f"{str(error_detail)}")
            return super().finalize_response(request, response, *args, **kwargs)

        response.set_cookie(
            "access_token",
            response.data["access"],
            max_age=settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"],
            httponly=settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"],
            samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
        )
        del response.data["access"]

        if response.data.get("refresh"):
            response.set_cookie(
                "refresh_token",
                response.data["refresh"],
                max_age=settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"],
                httponly=settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"],
                samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
            )
            del response.data["refresh"]

        return super().finalize_response(request, response, *args, **kwargs)


class JWTAuthenticationWithCookie(JWTAuthentication):
    def authenticate(self, request):
        header = self.get_header(request)

        if header is None:
            raw_token = request.COOKIES.get(settings.SIMPLE_JWT["AUTH_COOKIE"]) or None
        else:
            raw_token = self.get_raw_token(header)
        if raw_token is None:
            return None

        validated_token = self.get_validated_token(raw_token)

        return self.get_user(validated_token), validated_token


class MultipleWSTokens(Exception):
    """More than 1 WebSocket token for single user."""

    pass


@api_view(["GET"])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthenticationWithCookie])
# @transaction.atomic
def create_ws_token(request):
    """
    Create and obtain websocket token for access to websocket endpoints.
    """
    try:
        GHUser.objects.get(pk=request.user.id)
    except GHUser.DoesNotExist:
        return Response(
            {"detail": "User model does not exist."}, status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"detail": f"Some problems with the user account."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    if request.method == "GET":
        try:
            with transaction.atomic():
                token = Token.objects.filter(user=request.user)
                if token.count() > 1:
                    raise MultipleWSTokens
                elif token.count() == 0:
                    token = Token.objects.create(user=request.user)
                elif token.count() == 1:
                    utc_now = datetime.utcnow()
                    utc_now = utc_now.replace(tzinfo=pytz.utc)

                    if token[0].created < utc_now - settings.WS_AUTH["TOKEN_LIFETIME"]:
                        new_key = token[0].generate_key()
                        token.update(key=new_key, created=utc_now)
                    token = token[0]
            return Response({"token": token.key})
                
        except IntegrityError:
            return Response({"detail": "Token creating/updating failed."},
                            status=status.HTTP_400_BAD_REQUEST)
        except MultipleWSTokens:
            return Response({"detail": "Multiple WS tokens in db."},
                status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
def register(request):
    data = request.data
    username = data.get("username", None)
    password = data.get("password", None)
    email = data.get("email", None)
    github_username = data.get("github_username", None)
    username_exists = User.objects.filter(username=username).exists()
    email_exists = User.objects.filter(email=email).exists()
    if not username_exists and not email_exists:
        User.objects.create_user(username, email, password)
        ghuser = GHUser(username=username, github_username=github_username)
        ghuser.save()
        return Response(
            {"detail": "User created successfully"}, status=status.HTTP_200_OK
        )
    else:
        error_data = {}
        if username_exists:
            error_data["username"] = "A user with that username already exists"
        if email_exists:
            error_data[
                "email"
            ] = "A user is already registered with this e-mail address"
        return Response({"detail": error_data}, status=status.HTTP_409_CONFLICT)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthenticationWithCookie])
def logout(request):
    try:
        response = Response(status=status.HTTP_205_RESET_CONTENT)
        access_token = request.COOKIES.get("access_token") or None
        if access_token is not None:
            response.delete_cookie("access_token")
        refresh_token = request.COOKIES.get("refresh_token") or None
        if refresh_token is not None:
            response.delete_cookie("refresh_token")
            token = RefreshToken(refresh_token)
            token.blacklist()
        return response
    except Exception as e:
        return Response(status=status.HTTP_400_BAD_REQUEST)
