import requests
from celery_app.pipeline.base import BaseCollector
from celery_app.configs.logging_config import get_logger
from celery_app.configs.config import get_config

log = get_logger("collect_news")


class NewsCollector(BaseCollector):
    def __init__(self, source="arirang"):
        self.source = source

    def collect(self):
        if self.source == "arirang":
            return self.collect_arirang()
        # elif self.source == "blog":
        #     return self.collect_blog()
        else:
            raise ValueError(f"Unknown source: {self.source}")

    def collect_arirang(self):
        try:
            if not get_config()["ARIRANG_URL"] or not get_config()["SERVICE_KEY"]:
                raise ValueError("Configuration values are missing.")
            params = {
                "serviceKey": get_config()["SERVICE_KEY"],
                "pageNo": "0",
                "numOfRows": get_config()["NEWS_NUMBER"],
            }
            headers = {"accept": "application/json"}
            response = requests.get(
                f"{get_config()['ARIRANG_URL']}/news",
                params=params,
                headers=headers,
            )
            if response.status_code != 200:
                log.error(
                    f"Failed to fetch news articles, status code: {response.status_code}"
                )
                response.raise_for_status()
            log.info("Successfully fetched news articles.")
            return response.json().get("items", [])
        except requests.exceptions.RequestException as e:
            log.error(f"Error occurred during news API request: {e}")
            raise
        except Exception as e:
            log.error(f"An unexpected error occurred: {e}")
            raise
