#!/usr/bin/env python

from celery import Celery
from celery.signals import worker_process_init
from . import celery_config
from .models.db import init_db
from .services.collect_news import get_arirang_news
from .services.translate import googletrans_translate

celery_app = Celery('scheduler')
celery_app.config_from_object(celery_config)

# Worker process initialization hook to set up connections
@worker_process_init.connect
def init_worker(**kwargs):
    init_db()
    print("Worker process initialized, setting up connections...")

@celery_app.task(name="scheduler.collect_news")
def collect_news():
    news = get_arirang_news()
    translated_news = googletrans_translate(news, "ko", "en")
