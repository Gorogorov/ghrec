#!/bin/sh

until cd /usr/src/app/
do
    echo "Waiting for server volume..."
done

celery -A github_rec_theme worker --loglevel=info --concurrency 1 -E