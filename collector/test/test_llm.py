import pytest
from celery_app.models.init_db import init_postgresql, Atomic
from celery_app.services.translate_llm import llm_translate_news
from celery_app.models.news.news import News
from celery_app.models.news.english_news import NewsEnglish
from celery_app.models.news.llm_translate import LlmTransalte
from sqlalchemy.sql import exists


# 데이터베이스 초기화
@pytest.fixture(autouse=True)
def init():
    init_postgresql()


def test_classify_news_and_update():
    with Atomic() as db:
        news_item = db.query(News).first()
        news_content = (
            db.query(NewsEnglish)
            .filter(NewsEnglish.news_id == news_item.news_id)
            .first()
            .content
        )
        print(news_item)
        # Act: 뉴스 항목의 카테고리 분류
        llm_translated_content = llm_translate_news(news_content)
        LlmTransalte.create(
            db,
            news_id=news_item.news_id,
            english=llm_translated_content["english"],
            korean=llm_translated_content["korean"],
        )
        assert False
        # 뉴스 항목 업데이트


def test_classify_news_and_update():
    with Atomic() as db:
        news_items = (
            db.query(News)
            .filter(~exists().where(LlmTransalte.news_id == News.news_id))
            .all()[:50]
        )

        for news_item in news_items:
            news_contents = (
                db.query(NewsEnglish)
                .filter(NewsEnglish.news_id == news_item.news_id)
                .all()
            )

            for news_content in news_contents:
                llm_translated_content = llm_translate_news(news_content.content)
                print(llm_translated_content)
                LlmTransalte.create(
                    db,
                    news_id=news_item.news_id,
                    english=llm_translated_content["english"],
                    korean=llm_translated_content["korean"],
                )
