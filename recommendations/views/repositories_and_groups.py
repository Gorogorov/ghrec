from rest_framework.response import Response
from rest_framework.decorators import (
    api_view,
    permission_classes,
    authentication_classes,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.core.paginator import Paginator

from recommendations.models import GHUser
from recommendations.serializers import *
from recommendations.views.authenticate import JWTAuthenticationWithCookie
from recommendations.tasks import cltask_starred_repositories_of_stargazers


@api_view(["GET"])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthenticationWithCookie])
def user_repositories(request):
    """
    List user repositories.
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
        reps_per_page = 30
        response_data = {}

        ghuser_repositories = GHUser.objects.get(pk=request.user.id).repositories.all()

        ghuser_repositories_paginator = Paginator(
            ghuser_repositories, per_page=reps_per_page
        )
        page = request.query_params.get("page")
        if page is None:
            return Response(
                {"detail": "Specify page number in parameters of the query."},
                status=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            )

        ghuser_repositories = ghuser_repositories_paginator.get_page(page)
        response_data["num_pages"] = ghuser_repositories_paginator.num_pages

        serializer = DynamicRepositorySerializer(
            ghuser_repositories, context={"request": request}, many=True
        )

        response_data["repositories"] = serializer.data
        return Response(response_data)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthenticationWithCookie])
def user_groups_list(request):
    """
    Retrieve user groups, create new group.
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
        groups_per_page = 30
        response_data = {}
        ghuser_groups = GHRepositoryGroup.objects.filter(user=request.user.id)

        ghuser_groups_paginator = Paginator(ghuser_groups, per_page=groups_per_page)
        page = request.query_params.get("page")
        if page is None:
            return Response(
                {"detail": "Specify page number in parameters of the query."},
                status=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            )

        ghuser_groups = ghuser_groups_paginator.get_page(page)
        response_data["num_pages"] = ghuser_groups_paginator.num_pages

        serializer = RepositoryGroupSerializer(
            ghuser_groups, context={"request": request}, many=True
        )

        response_data["groups"] = serializer.data
        return Response(response_data)

    elif request.method == "POST":
        serializer = RepositoryGroupSerializer(
            data=request.data, context={"request": request}
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthenticationWithCookie])
def user_group(request, group_name):
    """
    Retrieve, modify or remove user group by name.
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

    try:
        ghgroup = GHRepositoryGroup.objects.get(user=request.user.id, name=group_name)
    except GHRepositoryGroup.DoesNotExist:
        return Response(
            {"detail": "Requested group does not exist."},
            status=status.HTTP_404_NOT_FOUND,
        )
    except Exception as e:
        return Response(
            {"detail": f"Some problems with the requested group."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    if request.method == "GET":
        serializer = RepositoryGroupSerializer(ghgroup, context={"request": request})
        return Response(serializer.data)

    elif request.method == "PATCH":
        serializer = RepositoryGroupSerializer(
            ghgroup, data=request.data, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "DELETE":
        ghgroup.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthenticationWithCookie])
def compute_recommendations(request, group_name):
    """
    Retrieve user groups, create new group.
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

    try:
        ghgroup = GHRepositoryGroup.objects.get(user=request.user.id, name=group_name)
    except GHRepositoryGroup.DoesNotExist:
        return Response(
            {"detail": "Requested group does not exist."},
            status=status.HTTP_404_NOT_FOUND,
        )
    except Exception:
        return Response(
            {"detail": f"Some problems with the requested group."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    if request.method == "GET":
        task_result = cltask_starred_repositories_of_stargazers(ghgroup)
        print(task_result)
        return Response(
            # {"celery_task_id": task_result.task_id}, status=status.HTTP_202_ACCEPTED
            {"celery_task_id": 0}, status=status.HTTP_202_ACCEPTED
        )
