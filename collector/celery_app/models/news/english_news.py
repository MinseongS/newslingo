from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import Session
from celery_app.models.base import Base


class NewsEnglish(Base):
    __tablename__ = "news_english"

    id = Column(Integer, primary_key=True, index=True)
    news_id = Column(String, ForeignKey("news.news_id"), index=True, nullable=False)
    language = Column(String, default="en", nullable=False)
    title = Column(Text, nullable=False)
    content = Column(Text, nullable=False)

    @classmethod
    def create(cls, db: Session, news_id: str, title: str, content: str):
        """
        Create a new NewsEnglish record in the database.

        :param db: Database session
        :param news_id: Unique news identifier
        :param title: Title of the news in English
        :param content: Content of the news in English
        :return: Newly created NewsEnglish object
        """
        new_news_english = cls(news_id=news_id, title=title, content=content)
        db.add(new_news_english)
        db.commit()
        db.refresh(new_news_english)
        return new_news_english
