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
        for user_starred_rep in user_starred_reps:
            user_starred_rep["users"] = user.pk
            ghrepository = GHRepository(name=user_starred_rep["name"],
                                        owner=user_starred_rep["owner"],
                                        description=user_starred_rep["description"],
                                        url=user_starred_rep["url"],
                                        num_stars=user_starred_rep["stargazerCount"])
            ghrepository.save()
            ghrepository.users.add(user)
            ghrepository.save()
        user.last_reps_update = timezone.now()
        user.save()
    except GHUser.DoesNotExist:
        logging.exception("Tried to retrieve starred repositories for non-existing user '%s'" % username)
    except Exception as e:
        logging.exception(e)


@clapp.task
def cltask_starred_repositories_of_stargazers(ghuser, ghgroup):
    batch_size=8
    try:
        group_repositories = ghgroup.repositories
        stargazers_starred_reps = gh_get_starred_repositories_of_stargazers(group_repositories,
                                                                            batch_size)
        
        # starred_reps_url = stargazers_starred_reps.keys()
        # existed_reps = GHRepository.objects.get(url__in=starred_reps_url)
        # existed_urls = [rep.url for rep in existed_reps]
        # new_urls = set(starred_reps_url) - set(existed_urls)

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

        print(starred_reps[0].name)
        starred_reps = GHRepository.objects.bulk_create(
                                         starred_reps,
                                         update_conflicts=True,
                                         unique_fields=["url"],
                                         update_fields=["name",
                                                        "owner",
                                                        "description",
                                                        "num_stars"])

        print(starred_reps[0].id)
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
    except GHUser.DoesNotExist:
        logging.exception("Tried to retrieve starred repositories for non-existing user")
    except Exception as e:
        logging.exception(e)



# @clapp.task
# def cltask_starred_repositories_of_stargazers(ghuser, ghgroup):
#     batch_size=8
#     try:
#         group_repositories = ghgroup.repositories
#         stargazers_starred_reps = gh_get_starred_repositories_of_stargazers(group_repositories,
#                                                                             batch_size)
#         print("retrieved")
#         retrieved_reps = []
#         retrieved_hits = []
#         time_a, time_b, time_b2, time_c = 0, 0, 0, 0
#         for rep_url, rep_data in stargazers_starred_reps.items():
#             time1 = time.time()
#             try:
#                 ghrepository = GHRepository.objects.get(url=rep_url)
#             except GHRepository.DoesNotExist:
#                 ghrepository = None
#             except Exception as e:
#                 logging.exception(e)
#                 return
#             time_a += time.time() - time1
#             time1 = time.time()
            
#             if ghrepository is None:
#                 ghrepository = GHRepository(name=rep_data["name"],
#                                             owner=rep_data["owner"],
#                                             description=rep_data["description"],
#                                             url=rep_url,
#                                             num_stars=rep_data["num_stars"])
#             retrieved_reps.append(ghrepository)
#             retrieved_hits.append(rep_data["count"])
#             time_b += time.time() - time1

#         time1 = time.time()
#         GHRepository.objects.bulk_create(retrieved_reps)
#         time_b += time.time() - time1
        
#         time1 = time.time()
#         for ghrepository, num_of_hits in zip(retrieved_reps, retrieved_hits):
#             ghrepository_rec = GHRecommendedRepository(group=ghgroup,
#                                                        repository=ghrepository,
#                                                        num_of_hits=num_of_hits)
#             ghrepository_rec.save()
#             time_c += time.time() - time1
#         print("saved")
#         print(time_a, time_b, time_b2, time_c)
#     except GHUser.DoesNotExist:
#         logging.exception("Tried to retrieve starred repositories for non-existing user")
#     except Exception as e:
#         logging.exception(e)
