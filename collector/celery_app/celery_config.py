#!/usr/bin/env python

import os
from celery import Celery
from celery.schedules import crontab, timedelta
from kombu import Exchange, Queue
from celery.signals import worker_ready

# RabbitMQ와 Redis 설정
DEPLOYMENT_TARGET = os.getenv("DEPLOYMENT_TARGET")
RABBITMQ_USER = os.getenv("RABBITMQ_DEFAULT_USER", "guest")
RABBITMQ_PASSWORD = os.getenv("RABBITMQ_DEFAULT_PASS", "guest")

# RabbitMQ 서버 호스트 설정
RABBITMQ_SERVER_HOST = os.getenv("CELERY_BROKER_URL", "localhost")
RABBITMQ_PORT = os.getenv("RABBITMQ_EXTERNAL_PORT", "5672")
broker_url = (
    f"amqp://{RABBITMQ_USER}:{RABBITMQ_PASSWORD}@{RABBITMQ_SERVER_HOST}:{RABBITMQ_PORT}"
)
# result_backend_transport_options = broker_transport_options = {
#     "visibility_timeout": 1800,
#     "heartbeat": 60,
# }

# Redis 설정
REDIS_SERVER_HOST = os.getenv("REDIS_EXTERNAL_SERVER_HOST", "localhost")
REDIS_PORT = os.getenv("REDIS_EXTERNAL_PORT", "6379")
result_backend = f"redis://{REDIS_SERVER_HOST}:{REDIS_PORT}/0"
broker_connection_retry_on_startup = True


task_serializer = "json"
result_serializer = "json"
accept_content = ["json"]
timezone = "Asia/Seoul"
enable_utc = True
worker_concurrency = 1
worker_prefetch_multiplier = 1
task_track_started = True
result_expires = 600
task_time_limit = 259140


# 기본 큐 설정
task_default_queue = "collector"
task_default_exchange = "direct"
task_default_routing_key = "default"

# 작업 큐 및 라우팅 설정
task_queues = (
    Queue(
        name="collector",
        exchange=Exchange(name="collector", type="direct"),
        routing_key="default",
    ),
)


@worker_ready.connect
def first_run(sender, **kwargs):
    sender.app.send_task("scheduler.collect_news", queue="collector")


# Beat 스케줄 설정
beat_schedule = {
    "collect_news": {
        "task": "scheduler.collect_news",  # 작업 경로는 실제 경로로 수정 필요
        "schedule": timedelta(hours=1),
        "options": {"queue": "collector"},  # collector 큐로 지정
    },
}
