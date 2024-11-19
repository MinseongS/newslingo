#!/usr/bin/env python

from celery import Celery
from celery.signals import worker_process_init
from . import celery_config
from .models.init_db import init_postgresql, Atomic
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
    news = get_arirang_news()
    log.info(f"Fetched {len(news['items'])} news items from Arirang.")
    for item in news["items"]:
        try:
            # Atomic 컨텍스트 매니저로 트랜잭션 관리
            with Atomic() as db:
                news_id = item["news_url"].split("id=")[-1]
                log.debug(f"Processing news_id: {news_id}")

                # 기존 뉴스 데이터 확인
                existing_news = db.query(News).filter_by(news_id=news_id).first()
                if existing_news:
                    log.info(f"News entry already exists for news_id: {news_id}, skipping.")
                    continue

                news_data = {
                    "news_id": news_id,
                    "news_url": item["news_url"],
                    "thum_url": item["thum_url"],
                    "broadcast_date": item["broadcast_date"],
                    "title": item["title"],
                    "content": item["content"],
                }

                # News 엔트리 생성
                news_obj = News.create(
                    db,
                    news_id=news_data["news_id"],
                    news_url=news_data["news_url"],
                    broadcast_date=news_data["broadcast_date"],
                    thum_url=news_data["thum_url"]
                )
                log.info(f"News entry created: {news_id}")

                # English 번역 데이터 확인 및 생성
                if not db.query(NewsEnglish).filter_by(news_id=news_obj.news_id).first():
                    NewsEnglish.create(
                        db,
                        news_id=news_obj.news_id,
                        title=news_data["title"],
                        content=news_data["content"]
                    )
                    log.info(f"English news entry created for news_id: {news_id}")

                # Korean 번역 데이터 확인 및 생성
                if not db.query(NewsKorean).filter_by(news_id=news_obj.news_id).first():
                    translated_title = googletrans_translate(item["title"], "en", "ko").text
                    translated_content = googletrans_translate(item["content"], "en", "ko").text
                    NewsKorean.create(
                        db,
                        news_id=news_obj.news_id,
                        title=translated_title,
                        content=translated_content
                    )
                    log.info(f"Korean translation created for news_id: {news_id}")

        except Exception as e:
            log.error(f"Error processing news_id: {item.get('news_id', 'unknown')} - {e}")