#!/usr/bin/env python
# -*- coding: utf-8, euc-kr -*-
import logging as log
import os
from celery_app.configs import logging_config
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from celery_app.models.base import Base

load_dotenv('celery_app/configs/.env.local')

# 데이터베이스를 관리하는 클래스 정의
class Data:
    def __init__(self):
        self.db_engine = None
        self.SessionLocal = None

_data = Data()

# 데이터베이스 초기화 함수 정의
def init_postgresql():
    # 데이터베이스 연결 구성
    DATABASE_URL = os.getenv("DATABASE_URL")
    if not DATABASE_URL:
        raise ValueError("DATABASE_URL is not set in the environment variables.")

    # SQLAlchemy 엔진 및 세션 설정
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    SessionLocal = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))
    
    log.info("init_postgresql called in init_db.py")
    # 데이터베이스 연결 설정 저장
    _data.db_engine = engine
    _data.SessionLocal = SessionLocal

    Base.metadata.create_all(bind=engine)


def get_db():
    """
    현재 초기화된 데이터베이스 세션을 반환.
    """
    if _data.SessionLocal is None:
        raise ValueError("Database has not been initialized. Call init_postgresql() first.")
    return _data.SessionLocal()


def atomic():
    """
    원자적 트랜잭션 컨텍스트 반환.
    """
    db = get_db()
    return db.begin()


def close_db():
    """
    데이터베이스 연결을 닫는 함수.
    """
    if _data.SessionLocal:
        log.info("closing db in init_db.py")
        _data.SessionLocal.remove()
    if _data.db_engine:
        _data.db_engine.dispose()
