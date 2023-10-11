import json

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
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.exceptions import InvalidToken

from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.middleware import csrf

# from recommendations.tasks import cltask_user_starred_repositories
from recommendations.models import GHUser


class CookieTokenRefreshSerializer(TokenRefreshSerializer):
    refresh = None

    def validate(self, attrs):
        attrs["refresh"] = self.context["request"].COOKIES.get("refresh_token")
        if attrs["refresh"]:
            return super().validate(attrs)
        else:
            raise InvalidToken("No valid token found in cookie 'refresh_token'")


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
            raise exceptions.AuthenticationFailed("Bad credentials")

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
    serializer_class = CookieTokenRefreshSerializer

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


# def get_tokens_for_user(user):
#     refresh = RefreshToken.for_user(user)

#     return {
#         'refresh': str(refresh),
#         'access': str(refresh.access_token),
#     }


# @api_view(['POST'])
# def login(request):
#     data = request.data
#     response = Response()
#     username = data.get('username', None)
#     if username is None:
#         email = data.get('email', None)
#         user = User.objects.get(email=email)
#         username = user.username
#     password = data.get('password', None)
#     user = authenticate(username=username, password=password)
#     if user is not None and user.is_active:
#         data = get_tokens_for_user(user)
#         response.set_cookie(
#                             key = settings.SIMPLE_JWT['AUTH_COOKIE'],
#                             value = data["access"],
#                             expires = settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
#                             secure = settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
#                             httponly = settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
#                             samesite = settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'])
#         csrf.get_token(request)
#         response.data = {"message" : "Login successfully"}

#         return response
#     else:
#         return Response({"message" : {"non_field_errors": "Unable to log in with provided credentials"}},
#                          status=status.HTTP_409_CONFLICT)


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
            {"message": "User created successfully"}, status=status.HTTP_200_OK
        )
    else:
        error_data = {}
        if username_exists:
            error_data["username"] = "A user with that username already exists"
        if email_exists:
            error_data[
                "email"
            ] = "A user is already registered with this e-mail address"
        return Response({"message": error_data}, status=status.HTTP_409_CONFLICT)


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
