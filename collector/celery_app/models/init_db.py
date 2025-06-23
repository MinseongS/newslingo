#!/usr/bin/env python
# -*- coding: utf-8, euc-kr -*-
from celery_app.configs.logging_config import get_logger
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from celery_app.models.base import Base
from celery_app.configs.config import get_config

log = get_logger("db")

# 데이터베이스를 관리하는 클래스 정의
SessionLocal = None
engine = None


def init_postgresql():
    """
    데이터베이스 연결 초기화.
    """
    global SessionLocal, engine

    DATABASE_URL = get_config()["DATABASE_URL"]
    if not DATABASE_URL:
        raise ValueError("DATABASE_URL is not set in the environment variables.")

    # SQLAlchemy 엔진 및 세션 설정
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    SessionLocal = scoped_session(
        sessionmaker(autocommit=False, autoflush=False, bind=engine)
    )
    log.info(f"PostgreSQL database initialized. {DATABASE_URL}")

    # 데이터베이스 테이블 생성
    Base.metadata.create_all(bind=engine)


def get_db():
    """
    데이터베이스 세션 생성기.
    """
    if SessionLocal is None:
        raise ValueError(
            "Database has not been initialized. Call init_postgresql() first."
        )
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def close_db():
    """
    데이터베이스 연결 종료.
    """
    global SessionLocal, engine
    if SessionLocal:
        log.info("Closing database session.")
        SessionLocal.remove()
    if engine:
        log.info("Disposing database engine.")
        engine.dispose()


class Atomic:
    """
    원자적 트랜잭션 컨텍스트 매니저.
    """

    def __enter__(self):
        self.db = SessionLocal()
        self.transaction = self.db.begin()
        return self.db

    def __exit__(self, exc_type, exc_val, exc_tb):
        try:
            if exc_type:
                if self.transaction.is_active:  # 트랜잭션이 활성 상태인지 확인
                    self.transaction.rollback()
                    log.error(f"Transaction rolled back due to {exc_type}: {exc_val}")
            else:
                if self.transaction.is_active:  # 트랜잭션이 활성 상태인지 확인
                    self.transaction.commit()
                    log.info("Transaction committed successfully.")
        except Exception as inner_ex:
            log.error(f"Error during transaction management: {inner_ex}")
        finally:
            self.db.close()
