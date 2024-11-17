#!/usr/bin/env python
# -*- coding: utf-8, euc-kr -*-
import logging as log
import os
from celery_config.configs import logging_config
from dotenv import load_dotenv
from peewee import PostgresqlDatabase
from main.config import Config
from main.models.base import BaseModel
from main.models.contents import BaseModel as ContentBaseModel
from main.models import (
    initialize,
    models_list,  # models_list를 사용해 테이블 목록을 모듈화
)


load_dotenv('celery_app/configs/.env.local')

ARIRANG_URL = os.getenv("ARIRANG_URL")
SERVICE_KEY = os.getenv("SERVICE_KEY")

# 데이터베이스를 관리하는 클래스 정의
class Data:
    def __init__(self):
        self.db = None


_data = Data()


# 데이터베이스 초기화 함수 정의
@initialize
def init_postgresql(app: Config):
    # 데이터베이스 연결 구성
    db = PostgresqlDatabase(
        database=app.get_config("postgresql", "dbname"),
        host=app.get_config("postgresql", "host"),
        port=app.get_config("postgresql", "port"),
        user=app.get_config("postgresql", "user"),
        password=app.get_config("postgresql", "password"),
    )
    ddl_auto_config = app.get_config("postgresql", "ddl_auto")
    ddl_auto = ddl_auto_config.lower() == "true"
    
    log.info("init_postgresql called in init_db.py")

    # 기본 모델의 데이터베이스 설정
    BaseModel.set_db(db)
    ContentBaseModel.set_db(db)

    if ddl_auto:
        log.info("Running ddl_auto setup.")
        db.execute_sql("CREATE SCHEMA IF NOT EXISTS ims;")
        db.execute_sql("CREATE SCHEMA IF NOT EXISTS canals;")
        
        # models_list에서 모든 모델 가져와서 테이블 생성
        db.create_tables(models_list)

    _data.db = db


def get_db() -> PostgresqlDatabase:
    """
    현재 초기화된 데이터베이스 객체를 반환.
    """
    return _data.db


def atomic():
    """
    원자적 트랜잭션 컨텍스트 반환.
    """
    return get_db().atomic()


def close_db():
    """
    데이터베이스 연결을 닫는 함수.
    """
    if _data.db:
        log.info("closing db in init_db.py")
        _data.db.close()

