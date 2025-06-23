import pytest
from celery_app.models.init_db import init_postgresql
from celery_app.scheduler import collect_news
from celery_app.configs.config import get_config


@pytest.fixture(autouse=True)
def init(request):
    get_config("test")
    init_postgresql()


def test_collect_news_scheduler():
    collect_news()
