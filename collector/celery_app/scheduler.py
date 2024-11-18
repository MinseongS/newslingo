#!/usr/bin/env python

from celery import Celery
from celery.signals import worker_process_init
from . import celery_config
from .models.init_db import init_postgresql, get_db
from .services.collect_news import get_arirang_news
from .services.translate import googletrans_translate

from .models.news.news import News
from .models.news.english_news import NewsEnglish
from .models.news.korean_news import NewsKorean

import logging as log
from .configs import logging_config


celery_app = Celery('scheduler')
celery_app.config_from_object(celery_config)

# Worker process initialization hook to set up connections
@worker_process_init.connect
def init_worker(**kwargs):
    init_postgresql()
    log.info("Worker process initialized, database connection set up.")

@celery_app.task(name="scheduler.collect_news")
def collect_news():
    db = get_db()
    news = get_arirang_news()
    log.info(f"Fetched {len(news['items'])} news items from Arirang.")
    
    for item in news["items"]:
        try:
            news_id = item["news_url"].split("id=")[-1]
            log.debug(f"Processing news_id: {news_id}")

            news_data = {
                "news_id": news_id,
                "news_url": item["news_url"],
                "thum_url": item["thum_url"],
                "broadcast_date": item["broadcast_date"],
                "title": item["title"],
                "content": item["content"],
            }

            with db.begin():  # 트랜잭션 시작
                # Create News entry or fetch existing one
                news_obj = News.create(
                    db, 
                    news_id=news_data["news_id"], 
                    news_url=news_data["news_url"], 
                    broadcast_date=news_data["broadcast_date"], 
                    thum_url=news_data["thum_url"]
                )
                log.info(f"News entry created or fetched: {news_id}")

                # Check if English translation already exists
                existing_news_english = db.query(NewsEnglish).filter_by(news_id=news_obj.news_id).first()
                if not existing_news_english:
                    NewsEnglish.create(db, news_id=news_obj.news_id, title=news_data["title"], content=news_data["content"])
                    log.info(f"English news entry created for news_id: {news_id}")
                else:
                    log.debug(f"English news entry already exists for news_id: {news_id}")

                # Translate to Korean and create Korean news entry if not exists
                existing_news_korean = db.query(NewsKorean).filter_by(news_id=news_obj.news_id).first()
                if not existing_news_korean:
                    translated_title = googletrans_translate(item["title"], "en", "ko")
                    translated_content = googletrans_translate(item["content"], "en", "ko")
                    NewsKorean.create(db, news_id=news_obj.news_id, title=translated_title.text, content=translated_content.text)
                    log.info(f"Korean translation created for news_id: {news_id}")
                else:
                    log.debug(f"Korean translation already exists for news_id: {news_id}")

        except Exception as e:
            db.rollback()  # 트랜잭션 롤백
            log.error(f"Error processing news_id: {item.get('news_id', 'unknown')} - {e}")
        finally:
            db.close()  # 연결 닫기
