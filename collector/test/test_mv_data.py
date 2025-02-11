import pytest
from sqlalchemy.sql import exists

from celery_app.models.init_db import init_postgresql, Atomic
from celery_app.models.news.news import News
from celery_app.models.news.english_news import NewsEnglish
from celery_app.models.news.korean_news import NewsKorean
from celery_app.models.news.llm_translate import LlmTransalte


@pytest.fixture(autouse=True)
def init():
    """DB 초기화 (pytest 실행 시 매번 자동 호출)"""
    init_postgresql()


def test_overwrite_news_from_llm():
    with Atomic() as db:
        # 1) llm_translate가 있는 News만 찾기
        #    (방법 1) JOIN
        news_with_llm = (
            db.query(News)
            .join(LlmTransalte, LlmTransalte.news_id == News.news_id)
            .all()
        )

        # (방법 2) exists() 사용 예시 (원한다면 이렇게 해도 됨)
        # news_with_llm = (
        #     db.query(News)
        #     .filter(exists().where(LlmTransalte.news_id == News.news_id))
        #     .all()
        # )

        for news_item in news_with_llm:
            # 2) llm_translate 레코드 가져오기
            llm = (
                db.query(LlmTransalte)
                .filter(LlmTransalte.news_id == news_item.news_id)
                .first()
            )
            if not llm:
                # llm_translate가 여러 개일 수도 있다면 .all() 후 반복 처리 등 로직 수정 가능
                continue

            # 3) NewsEnglish 업데이트
            english_rows = (
                db.query(NewsEnglish)
                .filter(NewsEnglish.news_id == news_item.news_id)
                .all()
            )
            for eng_row in english_rows:
                eng_row.content = llm.english  # llm_translate.english 내용으로 덮어씀

            # 4) NewsKorean 업데이트
            korean_rows = (
                db.query(NewsKorean)
                .filter(NewsKorean.news_id == news_item.news_id)
                .all()
            )
            for kor_row in korean_rows:
                kor_row.content = llm.korean  # llm_translate.korean 내용으로 덮어씀

        # 5) 전체 변경사항 커밋
        db.commit()
