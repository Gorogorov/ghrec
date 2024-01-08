#!/bin/sh

echo "Daphne starting"
until cd /usr/src/app/
do
    echo "Waiting for server volume..."
done

daphne github_rec_theme.asgi:application -b 0.0.0.0 -p 8001