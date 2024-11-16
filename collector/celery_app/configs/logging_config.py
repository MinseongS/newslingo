import logging
from logging.handlers import TimedRotatingFileHandler

LOG_FILE = 'celery_app/logs/scheduler.log'

logging.basicConfig(
    level=logging.INFO,
    handlers=[
        TimedRotatingFileHandler(LOG_FILE, when="midnight", interval=1, backupCount=7),
        logging.StreamHandler()
    ],
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
