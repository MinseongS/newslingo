from sqlalchemy import Column, Integer, String, ForeignKey, JSON
from sqlalchemy.orm import relationship
from celery_app.models.base import Base


class TTS(Base):
    __tablename__ = "tts"

    id = Column(Integer, primary_key=True, index=True)
    news_id = Column(String, ForeignKey("news.news_id"), nullable=False, unique=True)
    full_text_audio_path = Column(String, nullable=True)
    sentences_audio_path = Column(JSON, nullable=True)

    news = relationship("News", back_populates="tts")


# 이제 News 모델에도 관계를 추가해야 합니다.
# News 모델 파일(news.py)을 열고 다음을 추가하세요.
# from sqlalchemy.orm import relationship
# ...
# class News(Base):
#     ...
#     tts = relationship("TTS", back_populates="news", uselist=False)
