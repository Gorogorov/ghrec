import time

import requests
import jinja2

token = "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"
url = "https://api.github.com/graphql"


def gh_get_user_starred_repositories(github_username):
    templateLoader = jinja2.FileSystemLoader(searchpath="recommendations/templates")
    templateEnv = jinja2.Environment(loader=templateLoader)
    github_query_template_f = "user_starred_repositories.jinja2"
    github_query_template = templateEnv.get_template(github_query_template_f)

    head = {"Authorization": f"bearer {token}"}
    
    github_query_vars = {"github_username": github_username}
    user_starred_reps_full_json = requests.post(
        url,
        json={"query": github_query_template.render(github_query_vars)},
        headers=head,
    ).json()

    user_starred_reps = user_starred_reps_full_json["data"]["user"][
        "starredRepositories"
    ]["edges"]
    for rep_ind in range(len(user_starred_reps)):
        user_starred_reps[rep_ind] = user_starred_reps[rep_ind]["node"]
        user_starred_reps[rep_ind]["owner"] = user_starred_reps[rep_ind]["owner"]["login"]

    return user_starred_reps

class GhApiException(Exception):
    "Github api error without coverage."
    pass

# def gh_starred_repositories_request_rec(url, head, github_query_template,
#                                         repository, batch_size, after_end_cursor):
#     github_query_vars = {"repository_name": repository.name,
#                         "repository_owner": repository.owner,
#                         "stargazers_batch_size" : batch_size,
#                         "after_end_cursor": after_end_cursor}
#     stargazers_reps_batch = requests.post(url,
#                                           json={"query": github_query_template.render(github_query_vars)},
#                                           headers=head)
#     if stargazers_reps_batch.status_code == 201:
#         if batch_size == 1:
#             raise GhApiException(str(stargazers_reps_batch))
#         batch_size_half = int(batch_size / 2)
#         reps_batch_half1, after_end_cursor = gh_starred_repositories_request_rec(url, head,
#                                                 github_query_template, repository,
#                                                 batch_size_half, after_end_cursor)
#         reps_batch_half2, after_end_cursor = gh_starred_repositories_request_rec(url, head,
#                                                 github_query_template, repository,
#                                                 batch_size - batch_size_half, after_end_cursor)
#         ghapi_requests_remaining = reps_batch_half2.headers["X-RateLimit-Remaining"]
#         ghapi_requests_reset = reps_batch_half2.headers["X-RateLimit-Reset"]

#         stargazers_reps_batch_info = stargazers_reps_batch["data"]["repository"]["stargazers"]["pageInfo"]
#     github_query_vars["after_end_cursor"] = 'after: "' + stargazers_reps_batch_info['endCursor'] + '"'
#     has_next_page = stargazers_reps_batch_info["hasNextPage"]

#     stargazers_starred_reps = stargazers_reps_batch["data"]["repository"]["stargazers"]["edges"]
#     ghapi_requests_remaining = stargazers_reps_batch.headers["X-RateLimit-Remaining"]
#     ghapi_requests_reset = stargazers_reps_batch.headers["X-RateLimit-Reset"]

# def gh_get_starred_repositories_of_stargazers_batch(github_query_vars, github_query_template, head):
#     batch_stargazers = [{} * github_query_vars["stargazers_batch_size"]]
#     is_batch_received = False
#     while not is_batch_received:
#         is_response_ok = False

#         while not is_response_ok:
#             if github_query_vars["stargazers_batch_size"] == 0:
#                 break
#             stargazers_reps_batch = requests.post(url,
#                                                 json={"query": github_query_template.render(github_query_vars)},
#                                                 headers=head)
#             if stargazers_reps_batch.status_code == 200:
#                 is_response_ok = True
#             else:
#                 github_query_vars["stargazers_batch_size"] = int(github_query_vars["stargazers_batch_size"] / 2)
#                 print(github_query_vars["stargazers_batch_size"])


def gh_get_stargazers(repository, github_query_template, head):
    stargazers_batch_size = 100
    github_query_vars = {"repository_name": repository.name,
                    "repository_owner": repository.owner,
                    "stargazers_batch_size" : stargazers_batch_size,
                    "stargazers_cursor": ""}
    
    stargazers_login = []
    has_next_stargazer = True
    while has_next_stargazer:
        github_query_vars["stagazers_batch_size"] = stargazers_batch_size

        is_response_ok = False
        while not is_response_ok:
            if github_query_vars["stargazers_batch_size"] == 0:
                break
            stargazers_batch_response = requests.post(url,
                                                json={"query": github_query_template.render(github_query_vars)},
                                                headers=head)

            if stargazers_batch_response.status_code == 200:
                is_response_ok = True
            else:
                github_query_vars["stargazers_batch_size"] = int(github_query_vars["stargazers_batch_size"] / 2)

        if not is_response_ok:
            raise GhApiException("Get stargazers: github api error for batch size 1")

        ghapi_requests_remaining = int(stargazers_batch_response.headers["X-RateLimit-Remaining"])
        ghapi_requests_reset = int(stargazers_batch_response.headers["X-RateLimit-Reset"])
        if ghapi_requests_remaining < 1:
            time.sleep(ghapi_requests_reset - time.time() + 1)
            continue

        stargazers_batch = stargazers_batch_response.json()["data"]["repository"]["stargazers"]
        stargazers_login_batch = [stargazer["node"]["login"] for stargazer in 
                                    stargazers_batch["edges"]
        ]
        stargazers_login.extend(stargazers_login_batch)
        has_next_stargazer = stargazers_batch["pageInfo"]["hasNextPage"]
        github_query_vars["stargazers_cursor"] = 'after: "' + stargazers_batch["pageInfo"]["endCursor"] + '"'
    
    return stargazers_login


def gh_get_starred_reps_list(users_login, users_batch_size, github_query_template, head):
    reps_batch_size = 100
    users_login_batches = [users_login[i:i+users_batch_size] for i in 
                                    range(0, len(users_login), users_batch_size)]
    login_to_alias = {users_login[i]: f"user{str(i)}"for i in range(len(users_login))}
    users_starred_reps = {login: [] for login in users_login}
    for users_login_batch in users_login_batches:
        users_batch = {login_to_alias[login]: 
                               {"reps_cursor": "",
                                "login": login}
                       for login in users_login_batch
        }
        github_query_vars = {"users_batch": users_batch}
        while len(github_query_vars["users_batch"]):
            github_query_vars["reps_batch_size"] = reps_batch_size

            is_response_ok = False
            while not is_response_ok:
                if github_query_vars["reps_batch_size"] == 0:
                    break
                starred_reps_batch_response = requests.post(url,
                                                    json={"query": github_query_template.render(github_query_vars)},
                                                    headers=head)

                if starred_reps_batch_response.status_code == 200:
                    is_response_ok = True
                else:
                    github_query_vars["reps_batch_size"] = int(github_query_vars["reps_batch_size"] / 2)
        
            if not is_response_ok:
                raise GhApiException("Get starred repositories: "
                                     "github api error for batch size 1")

            ghapi_requests_remaining = int(starred_reps_batch_response.headers["X-RateLimit-Remaining"])
            ghapi_requests_reset = int(starred_reps_batch_response.headers["X-RateLimit-Reset"])
            if ghapi_requests_remaining < 1:
                time.sleep(ghapi_requests_reset - time.time() + 1)
                continue

            # print(starred_reps_batch_response.json())
            for alias, user_data in starred_reps_batch_response.json()["data"].items():
                user_starred_reps_part = [rep["node"] for rep 
                                          in user_data["starredRepositories"]["edges"]]
                login = users_batch[alias]["login"]
                users_starred_reps[login].extend(user_starred_reps_part)

                has_next_page = user_data["starredRepositories"]["pageInfo"]["hasNextPage"]
                if not has_next_page:
                    del github_query_vars["users_batch"][alias]
                else:
                    reps_cursor = ('after: "' + 
                                user_data["starredRepositories"]["pageInfo"]["endCursor"] + 
                                '"'
                    )
                    github_query_vars["users_batch"][alias]["reps_cursor"] = reps_cursor
    for login, reps in users_starred_reps.items():
        print(f"{login}: {len(reps)}")
    return users_starred_reps


def gh_get_starred_repositories_of_stargazers(repositories, users_batch_size):
    # TODO: add simple recomendation system
    templateLoader = jinja2.FileSystemLoader(searchpath="recommendations/templates")
    templateEnv = jinja2.Environment(loader=templateLoader)
    # github_query_template_f = "stargazers_reps_query.jinja2"
    # github_query_template = templateEnv.get_template(github_query_template_f)
    # github_limits_template_f = "resource_limits.jinja2"
    # github_limits_template = templateEnv.get_template(github_limits_template_f)
    
    head = {"Authorization": f"bearer {token}"}

    # get all users who starred one of the repositories (stargazers) 
    github_stargazers_template_f = "stargazers_query.jinja2"
    github_stargazers_template = templateEnv.get_template(github_stargazers_template_f)
    stargazers_login = []
    for repository in repositories.all():
        stargazers_login_rep = gh_get_stargazers(repository, github_stargazers_template,
                                                 head)
        stargazers_login.extend(stargazers_login_rep)
    stargazers_login = list(set(stargazers_login))

    # get repositories that have been flagged by stargazers
    github_starred_reps_batch_template_f = "starred_reps_batch_query.jinja2"
    github_starred_reps_batch_template = templateEnv.get_template(
        github_starred_reps_batch_template_f
    )
    starred_reps_by_user = gh_get_starred_reps_list(stargazers_login,
                                               users_batch_size,
                                               github_starred_reps_batch_template,
                                               head
    )

    starred_reps_by_url = {}
    for reps in starred_reps_by_user.values():
        for rep in reps:
            if rep["url"] in starred_reps_by_url:
                starred_reps_by_url[rep["url"]]["count"] += 1
            else:
                starred_reps_by_url[rep["url"]] = {
                      "count": 1,
                      "name": rep["name"],
                      "owner": rep["owner"]["login"],
                      "description": rep["description"],
                      "num_stars": rep["stargazerCount"],
                }
    return starred_reps_by_url


    # starred_reps_of_stargazers_total = {}
    # for repository in repositories.all():
    #     # gh_limits = requests.post(url,
    #     #                           json={"query": github_limits_template.render()},
    #     #                           headers=head)
    #     # print("limits", gh_limits.json())

    #     github_query_vars = {"repository_name": repository.name,
    #                         "repository_owner": repository.owner,
    #                         "stargazers_batch_size" : stargazers_batch_size,
    #                         "stargazers_cursor": "",
    #                         "starred_reps_batch_size": 100,
    #                         "starred_reps_cursor": ""}
    #     print("vars", github_query_vars)
    #     has_next_stargazer = True
    #     while has_next_stargazer:
    #         # reduce batch size until 0 or OK response
    #         is_response_ok = False
    #         while not is_response_ok:
    #             if github_query_vars["stargazers_batch_size"] == 0:
    #                 break
    #             stargazers_reps_batch = requests.post(url,
    #                                                 json={"query": github_query_template.render(github_query_vars)},
    #                                                 headers=head)
    #             if stargazers_reps_batch.status_code == 200:
    #                 is_response_ok = True
    #             else:
    #                 print(stargazers_reps_batch.json())
    #                 github_query_vars["stargazers_batch_size"] = int(github_query_vars["stargazers_batch_size"] / 2)
    #                 print(github_query_vars["stargazers_batch_size"])
    #         print("header", stargazers_reps_batch.headers)
    #         # print(stargazers_reps_batch.json())
    #         ghapi_requests_remaining = int(stargazers_reps_batch.headers["X-RateLimit-Remaining"])
    #         ghapi_requests_reset = int(stargazers_reps_batch.headers["X-RateLimit-Reset"])
    #         if ghapi_requests_remaining < 1:
    #             time.sleep(ghapi_requests_reset - time.time() + 1)
    #             continue
    #         if not is_response_ok:
    #             raise GhApiException
    #         github_query_vars["stargazers_batch_size"] = stargazers_batch_size

    #         print("header", ghapi_requests_remaining, ghapi_requests_reset)
    #         stargazers_reps_batch = stargazers_reps_batch.json()
    #         # print("batch", stargazers_reps_batch)

    #         stargazers_reps_batch_info = stargazers_reps_batch["data"]["repository"]["stargazers"]["pageInfo"]
    #         github_query_vars["stargazers_cursor"] = 'after: "' + stargazers_reps_batch_info['endCursor'] + '"'
    #         has_next_stargazer = stargazers_reps_batch_info["hasNextPage"]

    #         stargazers_starred_reps = stargazers_reps_batch["data"]["repository"]["stargazers"]["edges"]
    #         for stargazer_starred_reps in stargazers_starred_reps:
    #             print("count", 
    #                   stargazer_starred_reps["node"]["starredRepositories"]["totalCount"],
    #                   stargazer_starred_reps["node"]["starredRepositories"]["pageInfo"]["hasNextPage"],
    #                   len(stargazer_starred_reps["node"]["starredRepositories"]["edges"]))
    #             stargazer_starred_reps = stargazer_starred_reps["node"]["starredRepositories"]["edges"]
    #             for starred_rep in stargazer_starred_reps:
    #                 starred_rep = starred_rep["node"]

    #             if starred_rep["url"] in starred_reps_of_stargazers_total:
    #                 starred_reps_of_stargazers_total[starred_rep["url"]]["count"] += 1
    #             else:
    #                 starred_reps_of_stargazers_total[starred_rep["url"]] = {"count": 1,
    #                                                                         **starred_rep}

    # # starred_reps_total_info_sorted = sorted(list(starred_reps_of_stargazers_total.items()),
    # #                                         key=lambda rep_info: rep_info[1]["count"])
    # return starred_reps_of_stargazers_total
