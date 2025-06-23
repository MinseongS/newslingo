from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import Session, relationship
from celery_app.models.base import Base
from datetime import datetime
import pytz


def get_kst_now():
    """Returns the current time in KST."""
    return datetime.now(pytz.timezone("Asia/Seoul"))


class News(Base):
    __tablename__ = "news"

    id = Column(Integer, primary_key=True, index=True)
    news_id = Column(String, unique=True, index=True, nullable=False)
    news_url = Column(String, nullable=False)
    thum_url = Column(String, nullable=True)
    broadcast_date = Column(DateTime, nullable=False)
    category = Column(String, nullable=True)
    created_date = Column(DateTime(timezone=True), default=get_kst_now, nullable=False)

    tts = relationship(
        "TTS", back_populates="news", uselist=False, cascade="all, delete-orphan"
    )

    @classmethod
    def create(
        cls,
        db: Session,
        news_id: str,
        news_url: str,
        broadcast_date: DateTime,
        category: str = None,
        thum_url: str = None,
    ):
        """
        Create a new News record in the database.

        :param db: Database session
        :param news_id: Unique news identifier
        :param news_url: URL of the news article
        :param broadcast_date: Broadcast date of the news
        :param thum_url: Thumbnail URL (optional)
        :return: Newly created News object
        """
        new_news = cls(
            news_id=news_id,
            news_url=news_url,
            broadcast_date=broadcast_date,
            category=category,
            thum_url=thum_url,
        )
        db.add(new_news)
        return new_news
