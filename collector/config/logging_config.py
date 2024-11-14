import logging
from logging.handlers import TimedRotatingFileHandler

LOG_FILE = 'logs/scheduler.log'

logging.basicConfig(
    level=logging.INFO,
    handlers=[
        TimedRotatingFileHandler(LOG_FILE, when="midnight", interval=1),
        logging.StreamHandler()
    ],
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
