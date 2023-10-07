import requests
import jinja2

token = "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"
url = "https://api.github.com/graphql"

head = {"Authorization": f"bearer {token}"}

end_cursor = ""
has_next_page = True
stargazers_batch_size = 20
starred_reps_total_info = {}

templateLoader = jinja2.FileSystemLoader(searchpath="./templates")
templateEnv = jinja2.Environment(loader=templateLoader)

github_query_template_f = "stargazers_reps_query.jinja2"
github_query_template = templateEnv.get_template(github_query_template_f)

# TODO: add cumulative sum for batch size optimizing

while has_next_page:
  github_query_vars = {"repository_owner": "de-code",
                       "repository_name": "python-tf-bodypix",
                       "stargazers_batch_size" : stargazers_batch_size,
                       "after_end_cursor": end_cursor}

  stargazers_reps_batch = requests.post(url,
                                        json={"query": github_query_template.render(github_query_vars)},
                                        headers=head).json()
  
  stargazers_reps_batch_info = stargazers_reps_batch["data"]["repository"]["stargazers"]["pageInfo"]
  end_cursor = 'after: "' + stargazers_reps_batch_info['endCursor'] + '"'
  has_next_page = stargazers_reps_batch_info["hasNextPage"]

  stargazers_starred_reps = stargazers_reps_batch["data"]["repository"]["stargazers"]["edges"]
  for stargazer_starred_reps in stargazers_starred_reps:
    stargazer_starred_reps = stargazer_starred_reps["node"]["starredRepositories"]["edges"]
    for starred_rep in stargazer_starred_reps:
      starred_rep = starred_rep["node"]

      if starred_rep["url"] in starred_reps_total_info:
        starred_reps_total_info[starred_rep["url"]]["count"] += 1
      else:
        starred_reps_total_info[starred_rep["url"]] = {"count": 1, "name": starred_rep["name"]}

starred_reps_total_info_sorted = sorted(list(starred_reps_total_info.items()),
                                        key=lambda rep_info: rep_info[1]["count"])

# TODO: add simple recomendation system

with open("test_obj.json", "w") as f:
  f.write(str(starred_reps_total_info_sorted))
