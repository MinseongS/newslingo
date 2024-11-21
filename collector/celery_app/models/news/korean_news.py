from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import Session
from celery_app.models.base import Base


class NewsKorean(Base):
    __tablename__ = "news_korean"

    id = Column(Integer, primary_key=True, index=True)
    news_id = Column(String, ForeignKey("news.news_id"), index=True, nullable=False)
    language = Column(String, default="ko", nullable=False)
    title = Column(Text, nullable=False)
    content = Column(Text, nullable=False)

    @classmethod
    def create(cls, db: Session, news_id: str, title: str, content: str):
        """
        Create a new NewsKorean record in the database.

        :param db: Database session
        :param news_id: Unique news identifier
        :param title: Title of the news in Korean
        :param content: Content of the news in Korean
        :return: Newly created NewsKorean object
        """
        new_news_korean = cls(news_id=news_id, title=title, content=content)
        db.add(new_news_korean)
        db.commit()
        db.refresh(new_news_korean)
        return new_news_korean
