from celery_app.pipeline.base import BaseSaver
from celery_app.models.init_db import Atomic
from celery_app.models.news.news import News
from celery_app.models.news.english_news import NewsEnglish
from celery_app.models.news.korean_news import NewsKorean
from celery_app.models.news.tts import TTS
from celery_app.configs.logging_config import get_logger

log = get_logger("news_saver")

# from celery_app.models.news.llm_translate import LlmTransalte


class NewsSaver(BaseSaver):
    def exists(self, news_id: str) -> bool:
        """Check if a news item already exists in the database."""
        with Atomic() as db:
            return db.query(News).filter_by(news_id=news_id).first() is not None

    def save(self, data):
        with Atomic() as db:
            # Check for existence and create within the same transaction
            existing_news = db.query(News).filter_by(news_id=data["news_id"]).first()
            if existing_news:
                log.info(f"Skipping save for existing news_id: {data['news_id']}")
                return
            news_obj = News.create(
                db,
                news_id=data["news_id"],
                news_url=data.get("news_url", ""),
                broadcast_date=data.get("broadcast_date", None),
                thum_url=data.get("thum_url", None),
                category=data.get("category", None),
            )
            # Flush the session to ensure the news_obj gets an ID and is persisted
            # before creating dependent objects.
            db.flush()

            NewsEnglish.create(
                db,
                news_id=news_obj.news_id,
                title=data["title"],
                content=data["translated_content"]["english"],
            )
            NewsKorean.create(
                db,
                news_id=news_obj.news_id,
                title=data["translated_title"],
                content=data["translated_content"]["korean"],
            )

            sentences_audio_paths = [
                sentence.get("audio_path") for sentence in data.get("sentences", [])
            ]

            db.add(
                TTS(
                    news_id=news_obj.news_id,
                    full_text_audio_path=data.get("full_text_audio_path"),
                    sentences_audio_path=sentences_audio_paths,
                )
            )
