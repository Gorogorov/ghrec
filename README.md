# Overview

GHREC recommends you GitHub repositories that are similar to yours. The project can help you find hidden gems.

1. Create a group of repositories that share a common theme
2. GHREC will find all the people who have starred these repositories.
3. Based on those people's stars, you will get a ranked list of repositories that are similar to the repositories in your group. 
4. If you wish, you can update the group with the repositories you found and return to step 1 

If you do not want to use the whole service, but only the scripts for finding repositories, check [tasks.py](/recommendations/tasks.py) and [github_gql_queries.py](/recommendations/github_gql_queries.py).

## Installation (Ubuntu)

Install [docker compose](https://docs.docker.com/compose/install/) and git.

Clone the repository
```
git clone https://github.com/Gorogorov/ghrec
cd ghrec
```
(Optional) Change the service parameters in the config
```
vim .env.public
```
Build and run docker containers
```
sudo docker-compose --env-file ./.env.public build
sudo docker-compose --env-file ./.env.public up
```
Go to http://localhost:8080/