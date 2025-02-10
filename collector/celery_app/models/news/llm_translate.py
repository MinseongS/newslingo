from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import Session
from celery_app.models.base import Base


class LlmTransalte(Base):
    __tablename__ = "llm_translate"

    id = Column(Integer, primary_key=True, index=True)
    news_id = Column(String, ForeignKey("news.news_id"), index=True, nullable=False)
    english = Column(Text, nullable=True)
    korean = Column(Text, nullable=True)

    @classmethod
    def create(cls, db: Session, news_id: str, english: str, korean: str):
        """
        Create a new LlmTransalte record in the database.
        """
        new_llm_translate = cls(news_id=news_id, english=english, korean=korean)
        db.add(new_llm_translate)
        db.commit()
        db.refresh(new_llm_translate)
        return new_llm_translate
