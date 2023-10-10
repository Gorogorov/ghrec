import logging
import time

from django.utils import timezone

from github_rec_theme.celery import clapp
from recommendations.github_gql_queries import gh_get_user_starred_repositories, gh_get_starred_repositories_of_stargazers
from recommendations.models import GHUser, GHRepository, GHRecommendedRepository


@clapp.task
def cltask_user_starred_repositories(username, github_username):
    try:
        user = GHUser.objects.get(username=username)
        user_starred_reps = gh_get_user_starred_repositories(github_username)
        starred_reps = []
        for user_starred_rep in user_starred_reps:
            user_starred_rep["users"] = user.pk
            ghrepository = GHRepository(name=user_starred_rep["name"],
                                        owner=user_starred_rep["owner"],
                                        description=user_starred_rep["description"],
                                        url=user_starred_rep["url"],
                                        num_stars=user_starred_rep["stargazerCount"])
            starred_reps.append(ghrepository)

        starred_reps = GHRepository.objects.bulk_create(
                                         starred_reps,
                                         update_conflicts=True,
                                         unique_fields=["url"],
                                         update_fields=["name",
                                                        "owner",
                                                        "description",
                                                        "num_stars"])

        rep_user_rels = []
        for rep in starred_reps:
            rep_user_rel = GHRepository.users.through(ghuser_id=user.pk,
                                                      ghrepository_id=rep.pk)
            rep_user_rels.append(rep_user_rel)

        GHRepository.users.through.objects.bulk_create(rep_user_rels,
                                                       ignore_conflicts=True)

        user.last_reps_update = timezone.now()
        user.save()
    except GHUser.DoesNotExist:
        logging.exception("Tried to retrieve starred repositories for non-existing user '%s'" % username)
    except Exception as e:
        logging.exception(e)


@clapp.task
def cltask_starred_repositories_of_stargazers(ghgroup):
    batch_size=8
    try:
        group_repositories = ghgroup.repositories
        stargazers_starred_reps = gh_get_starred_repositories_of_stargazers(group_repositories,
                                                                            batch_size)

        starred_reps = []
        urls_num_of_hits = {}
        for url, rep_data in stargazers_starred_reps.items():
            ghrepository = GHRepository(name=rep_data["name"],
                            owner=rep_data["owner"],
                            description=rep_data["description"],
                            url=url,
                            num_stars=rep_data["num_stars"])
            starred_reps.append(ghrepository)
            urls_num_of_hits[url] = rep_data["count"]

        starred_reps = GHRepository.objects.bulk_create(
                                         starred_reps,
                                         update_conflicts=True,
                                         unique_fields=["url"],
                                         update_fields=["name",
                                                        "owner",
                                                        "description",
                                                        "num_stars"])

        reps_recs = []
        for rep in starred_reps:
            rep_rec = GHRecommendedRepository(group=ghgroup,
                                              repository=rep,
                                              num_of_hits=urls_num_of_hits[rep.url])
            reps_recs.append(rep_rec)
        GHRecommendedRepository.objects.bulk_create(reps_recs,
                                                    update_conflicts=True,
                                                    unique_fields=["repository",
                                                                   "group"],
                                                    update_fields=["num_of_hits"])
    except Exception as e:
        logging.exception(e)
