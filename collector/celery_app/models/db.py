from db.base import SessionLocal
from models.news import News, NewsEnglish, NewsKorean, NewsChinese, NewsJapanese
from schemas.news import NewsCreate, NewsUpdate, NewsInDB
from api.translate import papago_translate, gemini_translate
from function import merge_title_content
from typing import List
import logging

logger = logging.getLogger('my_logger')

db = SessionLocal()

db_lang = {"en": NewsEnglish, "ko": NewsKorean,
           "zh-CN": NewsChinese, "ja": NewsJapanese}


def create_news(news: NewsCreate) -> NewsInDB:
    for news_data in news["items"]:
        try:
            news_id = news_data["news_url"].split("id=")[-1]

            existing_news = db.query(News).filter_by(news_id=news_id).first()
            if not existing_news:
                db_news = News(
                    news_id=news_id,
                    news_url=news_data["news_url"],
                    thum_url=news_data["thum_url"],
                    broadcast_date=news_data["broadcast_date"],
                )
                db.add(db_news)
            else:
                logger.info("News db에 데이터가 이미 존재합니다.")
                

            existing_news = db.query(NewsEnglish).filter_by(
                news_id=news_id).first()
            if not existing_news:
                db_english = NewsEnglish(
                    news_id=news_id,
                    language="en",
                    title=news_data["title"],
                    content=news_data["content"],
                )
                db.add(db_english)
            else:
                logger.info("NewsEnglish db에 데이터가 이미 존재합니다.")

            existing_news = db.query(NewsKorean).filter_by(
                news_id=news_id).first()
            if not existing_news:
                title = gemini_translate(news_data["title"], "english", "korean")
                content = gemini_translate(news_data["content"], "english", "korean")

                db_korean = NewsKorean(
                    news_id=news_id,
                    language="ko",
                    title=title,
                    content=content,
                )
                db.add(db_korean)
            else:
                logger.info("NewsKorean db에 데이터가 이미 존재합니다.")

            # existing_news = db.query(NewsChinese).filter_by(
            #     news_id=news_id).first()
            # if not existing_news:
            #     title = papago_translate(news_data["title"], "en", "zh-CN")
            #     content = papago_translate(news_data["content"], "en", "zh-CN")

            #     db_chinese = NewsChinese(
            #         news_id=news_id,
            #         language="zh-CN",
            #         title=title,
            #         content=content,
            #     )
            #     db.add(db_chinese)
            # else:
            #     logger.info("NewsChinese db에 데이터가 이미 존재합니다.")

            # existing_news = db.query(NewsJapanese).filter_by(
            #     news_id=news_id).first()
            # if not existing_news:
            #     title = papago_translate(news_data["title"], "en", "ja")
            #     content = papago_translate(news_data["content"], "en", "ja")

            #     db_japanese = NewsJapanese(
            #         news_id=news_id,
            #         language="ja",
            #         title=title,
            #         content=content,
            #     )
            #     db.add(db_japanese)
            # else:
            #     logger.info("NewsJapanese db에 데이터가 이미 존재합니다.")

            db.commit()
        except Exception as e:
            db.rollback()
            logger.warning("데이터 추가 중 오류가 발생했습니다."+str(e))
        finally:
            db.close()
    return


def get_news(news_id: int) -> NewsInDB:
    db_news = db.query(News).filter(News.id == news_id).first()
    return db_news


def get_page_news(source_lang, target_lang, index=None) -> List[NewsInDB]:
    firstDB = db_lang[source_lang]
    secondDB = db_lang[target_lang]

    query = (
        db.query(News.news_id, firstDB.title, firstDB.content,
                 firstDB.language, secondDB.title.label('translated_title'),
                 secondDB.content.label('translated_content'),
                 secondDB.language.label('translated_language'),
                 News.news_url, News.thum_url, News.broadcast_date)
        .join(firstDB, News.news_id == firstDB.news_id)
        .join(secondDB, News.news_id == secondDB.news_id)
        .order_by(News.broadcast_date.desc(), News.news_id.desc())
    )

    news = query.all()

    if index is not None:
        idx = next((i for i, item in enumerate(news)
                   if item.news_id == index), None)
        if idx is not None:
            news = news[idx+1:idx+21]
    else:
        news = news[:20]

    return news


def update_news(news_id: int, news: NewsUpdate) -> NewsInDB:
    db_news = db.query(News).filter(News.id == news_id).first()
    for field, value in news.dict(exclude_unset=True).items():
        setattr(db_news, field, value)
    db.commit()
    db.refresh(db_news)
    return db_news


def delete_news(news_id: int):
    db_news = db.query(News).filter(News.id == news_id).first()
    db.delete(db_news)
    db.commit()
