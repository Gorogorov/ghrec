import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'github_rec_theme.settings')
clapp = Celery('github_rec_theme')
clapp.config_from_object('django.conf:settings')

# Load task modules from all registered Django app configs.
clapp.autodiscover_tasks()
