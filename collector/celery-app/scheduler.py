#!/usr/bin/env python

from celery import Celery
from . import celery_config

celery_app = Celery('scheduler')
celery_app.config_from_object(celery_config)

@celery_app.task(name="scheduler.collect_news")
def collect_news():
    print("Collecting news...")