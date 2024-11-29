import requests
import json
import os
from dotenv import load_dotenv
from celery_app.configs.logging_config import get_logger

log = get_logger("collect_news")

load_dotenv('celery_app/configs/.env.local')

ARIRANG_URL = os.getenv("ARIRANG_URL")
SERVICE_KEY = os.getenv("SERVICE_KEY")

# 뉴스 API 요청 함수
def get_arirang_news():
    try:
        if not ARIRANG_URL or not SERVICE_KEY:
            raise ValueError("Configuration values are missing.")

        params = {
            'serviceKey': SERVICE_KEY,
            'pageNo': '0',
            'numOfRows': '15'
        }
        headers = {
            'accept': 'application/json'
        }

        # log.info("Sending request to Arirang News API...")
        response = requests.get(f"{ARIRANG_URL}/news", params=params, headers=headers)

        # 상태 코드 체크
        if response.status_code != 200:
            log.error(f"Failed to fetch news articles, status code: {response.status_code}")
            response.raise_for_status()
        log.info("Successfully fetched news articles.")
        
        # JSON 응답 파싱
        return response.json()

    except requests.exceptions.RequestException as e:
        log.error(f"Error occurred during news API request: {e}")
        raise
    except Exception as e:
        log.error(f"An unexpected error occurred: {e}")
        raise

if __name__ == "__main__":
    try:
        news_data = get_arirang_news()
        log.info(f"Successfully fetched {len(news_data.get('items', []))} news articles.")
    except Exception as e:
        log.error(f"Could not fetch news: {e}")