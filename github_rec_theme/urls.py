from django.contrib import admin
from django.urls import path

from recommendations.views import (
    authenticate,
    repositories_and_groups,
    recommendations,
)


urlpatterns = [
    path("admin/", admin.site.urls),
    path(
        "api/auth/token/",
        authenticate.CookieTokenObtainPairView.as_view(),
        name="token_obtain_pair",
    ),
    path(
        "api/auth/token/refresh/",
        authenticate.CookieTokenRefreshView.as_view(),
        name="token_refresh",
    ),
    path("api/auth/register/", authenticate.register, name="register"),
    path("api/auth/logout/", authenticate.logout),
    path("api/auth/ws_token/", authenticate.create_ws_token),
    path("api/user/repositories/", repositories_and_groups.user_repositories),
    path(
        "api/user/repositories/reload/",
        repositories_and_groups.user_repositories_reload,
    ),
    path("api/user/groups/", repositories_and_groups.user_groups_list),
    path("api/user/groups/<str:group_name>/", repositories_and_groups.user_group),
    path(
        "api/user/groups/<str:group_name>/recommendations/compute/",
        recommendations.recommendations_compute,
    ),
    path(
        "api/user/groups/<str:group_name>/recommendations/",
        recommendations.recommendations_list,
    ),
]
