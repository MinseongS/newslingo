#!/usr/bin/env python

from celery import Celery
from celery.signals import worker_process_init
from . import celery_config
from .models.init_db import init_postgresql, Atomic
from .services.collect_news import get_arirang_news
from .services.translate import googletrans_translate
from .services.classify_news import classify_news

from .models.news.news import News
from .models.news.english_news import NewsEnglish
from .models.news.korean_news import NewsKorean

from .configs.logging_config import get_logger, init_log

from .utils.utils import (
    normalize_newlines,
    calculate_korean_percentage,
    validate_paragraphs,
)

log = get_logger("scheduler")

celery_app = Celery("scheduler")
celery_app.config_from_object(celery_config)


# Worker process initialization hook to set up connections
@worker_process_init.connect
def init_worker(**kwargs):
    init_postgresql()
    init_log()
    log.info("Initializing worker process...")
    log.info("Worker process initialized, database connection set up.")


@celery_app.task(name="scheduler.collect_news")
def collect_news():
    news = get_arirang_news()
    log.info(f"Fetched {len(news['items'])} news items from Arirang.")

    for item in news["items"]:
        try:
            with Atomic() as db:
                news_id = item["news_url"].split("id=")[-1]
                log.debug(f"Processing news_id: {news_id}")

                content = normalize_newlines(item["content"])
                title = normalize_newlines(item["title"])

                content = content.replace("<div></div><div><br></div>", "")

                korean_percentage = calculate_korean_percentage(content)
                korean_percentage_title = calculate_korean_percentage(title)
                log.debug(f"Korean content percentage: {korean_percentage:.2f}%")

                if korean_percentage > 10 or korean_percentage_title > 10:
                    log.warning(
                        f"Skipping news_id: {news_id} due to high Korean percentage ({korean_percentage:.2f}%)."
                    )
                    continue

                if title == "STOCK":
                    translated_title = "주식"
                else:
                    translated_title = googletrans_translate(title, "en", "ko").text
                translated_content = googletrans_translate(content, "en", "ko").text

                if not validate_paragraphs(content, translated_content):
                    log.warning(
                        f"Skipping news_id: {news_id} due to paragraph mismatch."
                    )
                    continue

                existing_news = db.query(News).filter_by(news_id=news_id).first()
                if existing_news:
                    log.info(
                        f"News entry already exists for news_id: {news_id}, skipping."
                    )
                    continue

                try:
                    news_category = classify_news(content)["category"]
                except Exception as e:
                    log.error(f"Error while classifying news: {e}")
                    continue

                news_obj = News.create(
                    db,
                    news_id=news_id,
                    news_url=item["news_url"],
                    broadcast_date=item["broadcast_date"],
                    thum_url=item["thum_url"],
                    category=news_category,
                )

                NewsEnglish.create(
                    db,
                    news_id=news_obj.news_id,
                    title=title,
                    content=content,
                )

                NewsKorean.create(
                    db,
                    news_id=news_obj.news_id,
                    title=translated_title,
                    content=translated_content,
                )

                log.info(f"Completed processing for news_id: {news_id}")

        except Exception as e:
            log.error(
                f"Error processing news_id: {item.get('news_id', 'unknown')} - {e}"
            )
