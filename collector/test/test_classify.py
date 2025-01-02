import pytest
from celery_app.models.init_db import init_postgresql, Atomic
from celery_app.services.classify_news import classify_news
from celery_app.models.news.news import News  # News 모델 임포트
from celery_app.models.news.english_news import NewsEnglish


# 데이터베이스 초기화
@pytest.fixture(autouse=True)
def init():
    init_postgresql()


def test_classify_news_and_update():
    with Atomic() as db:
        # Arrange: 카테고리가 없는 뉴스 항목 하나 가져오기
        news_item = db.query(News).filter(News.category.is_(None)).first()
        news_content = (
            db.query(NewsEnglish)
            .filter(NewsEnglish.news_id == news_item.news_id)
            .first()
            .content
        )
        assert (
            news_item is not None
        ), "No news item found without a category for testing."

        print(news_content)
        # Act: 뉴스 항목의 카테고리 분류
        classified_category = classify_news(news_content)["category"]
        print(classified_category)
        # 뉴스 항목 업데이트
        news_item.category = classified_category
        db.commit()

        # Assert: 카테고리가 성공적으로 업데이트되었는지 확인
        updated_news_item = db.query(News).filter(News.id == news_item.id).first()
        assert (
            updated_news_item.category == classified_category
        ), "Category update failed."


def test_classify_all_news_and_update():
    with Atomic() as db:
        # Arrange: 카테고리가 없는 모든 뉴스 항목 가져오기
        news_items = db.query(News).filter(News.category.is_(None)).all()[:80]
        assert news_items, "No news items found without a category for testing."

        for news_item in news_items:
            # 뉴스 내용 가져오기 (English)
            news_content = (
                db.query(NewsEnglish)
                .filter(NewsEnglish.news_id == news_item.news_id)
                .first()
                .content
            )

            assert news_content, f"No content found for news_id: {news_item.news_id}"

            print(f"Classifying news_id {news_item.news_id}...")
            print(news_content)

            # Act: 뉴스 항목의 카테고리 분류
            classified_category = classify_news(news_content)["category"]
            print(f"Classified category: {classified_category}")

            # 뉴스 항목 업데이트
            news_item.category = classified_category

        # 모든 변경 사항 커밋
        db.commit()

        # Assert: 카테고리가 성공적으로 업데이트되었는지 확인
        for news_item in news_items:
            updated_news_item = db.query(News).filter(News.id == news_item.id).first()
            assert (
                updated_news_item.category is not None
            ), f"Category update failed for news_id: {news_item.news_id}"
