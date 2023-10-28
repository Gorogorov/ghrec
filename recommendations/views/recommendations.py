import logging

from rest_framework.response import Response
from rest_framework.decorators import (
    api_view,
    permission_classes,
    authentication_classes,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.core.paginator import Paginator

from recommendations.models import GHUser, GHRepositoryGroup, GHRecommendedRepository
from recommendations.serializers import RecommendedRepositorySerializer
from recommendations.views.authenticate import JWTAuthenticationWithCookie
from recommendations.tasks import cltask_starred_repositories_of_stargazers


logger = logging.getLogger(__name__)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthenticationWithCookie])
def recommendations_list(request, group_name):
    """
    Retrieve recommendations for group.
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
        groups_per_page = 30
        response_data = {}
        ghgroup_rec_reps = GHRecommendedRepository.objects.filter(group=ghgroup)

        ghgroup_rec_reps_paginator = Paginator(
            ghgroup_rec_reps, per_page=groups_per_page
        )
        page = request.query_params.get("page")
        if page is None:
            return Response(
                {"detail": "Specify page number in parameters of the query."},
                status=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            )

        ghgroup_rec_reps = ghgroup_rec_reps_paginator.get_page(page)
        response_data["num_pages"] = ghgroup_rec_reps_paginator.num_pages

        serializer = RecommendedRepositorySerializer(
            ghgroup_rec_reps, context={"request": request}, many=True
        )

        response_data["repositories"] = serializer.data
        return Response(response_data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthenticationWithCookie])
def recommendations_compute(request, group_name):
    """
    Retrieve starred repositories of stargazers of repositories
    from group.
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
        task_result = cltask_starred_repositories_of_stargazers.delay(request.user.id, group_name)
        ghgroup.get_recs_task_id = task_result.id
        ghgroup.save()
        logger.info(
            "Celery task submitted, "
            "name: cltask_starred_repositories_of_stargazers, "
            f"task_id: {task_result.id}"
        )
        return Response(status=status.HTTP_202_ACCEPTED)
