#!/bin/sh

until cd /usr/src/app/
do
    echo "Waiting for server volume..."
done

if [ "$DATABASE" = "postgres" ]
then
    while ! nc -z $POSTGRES_HOST $POSTGRES_PORT; do
      echo "Waiting for db to be ready..."
      sleep 0.1
    done
fi

python manage.py migrate

# ./manage.py collectstatic --noinput

python manage.py runserver 0.0.0.0:8000