import logging
from logging.handlers import TimedRotatingFileHandler
import os

LOG_FOLDER = 'celery_app/logs'
LOG_FILE = 'celery_app/logs/scheduler.log'
os.makedirs(LOG_FOLDER, exist_ok=True)

def init_log():
    log = logging.getLogger()  # root 로거 가져오기

    # 기존 핸들러 제거
    if log.hasHandlers():
        log.handlers.clear()

    # 핸들러 추가
    file_handler = TimedRotatingFileHandler(LOG_FILE, when="midnight", interval=1, backupCount=7)
    stream_handler = logging.StreamHandler()

    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    file_handler.setFormatter(formatter)
    stream_handler.setFormatter(formatter)

    log.addHandler(file_handler)
    log.addHandler(stream_handler)

    log.setLevel(logging.INFO)

def get_logger(name):
    return logging.getLogger(name)

