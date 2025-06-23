#!/usr/bin/env python

from celery import Celery
from celery.signals import worker_process_init
from celery_app import celery_config
from celery_app.models.init_db import init_postgresql
from celery_app.configs.logging_config import get_logger, init_log
from celery_app.configs.config import get_config
from celery_app.pipeline.pipeline import TextPipeline
from celery_app.services.converter import TTSConverter
from celery_app.services.news_collector import NewsCollector
from celery_app.services.news_translator import NewsTranslator
from celery_app.services.news_classifier import NewsClassifier
from celery_app.services.news_saver import NewsSaver

log = get_logger("scheduler")

celery_app = Celery("scheduler")
celery_app.config_from_object(celery_config)


# Worker process initialization hook to set up connections
@worker_process_init.connect
def init_worker(**kwargs):
    get_config()
    init_postgresql()
    init_log()
    log.info("Initializing worker process...")
    log.info("Worker process initialized, database connection set up.")


@celery_app.task(name="scheduler.collect_news")
def collect_news():
    config = get_config()
    pipeline = TextPipeline(
        collector=NewsCollector(),
        translator=NewsTranslator(),
        tts_converter=TTSConverter(output_dir=config["TTS_OUTPUT_DIR"]),
        classifier=NewsClassifier(),
        saver=NewsSaver(),
    )
    pipeline.run()
