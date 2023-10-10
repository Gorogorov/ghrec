"""github_rec_theme URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from recommendations.views import authenticate, repositories_and_groups


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/token/', authenticate.CookieTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path('api/auth/token/refresh/', authenticate.CookieTokenRefreshView.as_view(), name="token_refresh"),
    path('api/auth/register/', authenticate.register, name="register"),
    path('api/auth/logout/', authenticate.logout),
    path('api/user/repositories/', repositories_and_groups.user_repositories),
    path('api/user/groups/', repositories_and_groups.user_groups_list),
    path('api/user/groups/<str:group_name>/', repositories_and_groups.user_group),
    path('api/user/groups/<str:group_name>/compute_recommendations/', repositories_and_groups.compute_recommendations),
    # path('api/user/groups/<str:group_name>/recommendations/', repositories_and_groups.get_recommendations),
]
