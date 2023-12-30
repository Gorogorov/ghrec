FROM python:3.10-alpine

WORKDIR /usr/src/app/
RUN mkdir -p $WORKDIR/static
RUN mkdir -p $WORKDIR/media

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN apk update \
    && apk add postgresql-dev gcc python3-dev musl-dev git

RUN pip install --upgrade pip

COPY ./requirements.txt /usr/src/app/
RUN pip install -r requirements.txt

COPY github_rec_theme/ /usr/src/app/github_rec_theme/
COPY recommendations/ /usr/src/app/recommendations/
COPY logs/ /usr/src/app/logs/

COPY ./manage.py /usr/src/app/
COPY ./entrypoint_django.sh /usr/src/app/
COPY ./entrypoint_worker.sh /usr/src/app/
COPY ./entrypoint_daphne.sh /usr/src/app/

RUN chmod +x /usr/src/app/entrypoint_django.sh
RUN chmod +x /usr/src/app/entrypoint_worker.sh
RUN chmod +x /usr/src/app/entrypoint_daphne.sh