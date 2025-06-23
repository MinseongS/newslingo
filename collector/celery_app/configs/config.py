import os
from dotenv import load_dotenv

_config_cache = {}


def get_config(env=None):
    global _config_cache
    if env is None:
        env = os.getenv("APP_ENV", "local")
    if env in _config_cache:
        return _config_cache[env]
    # config.py와 같은 폴더 기준으로 경로 생성
    current_dir = os.path.dirname(os.path.abspath(__file__))
    dotenv_path = os.path.join(current_dir, f".env.{env}")
    load_dotenv(dotenv_path, override=False)  # 이미 로드된 값은 덮어쓰지 않음
    config = {
        "DATABASE_URL": os.getenv("DATABASE_URL"),
        "ARIRANG_URL": os.getenv("ARIRANG_URL"),
        "SERVICE_KEY": os.getenv("SERVICE_KEY"),
        "GEMINI_KEY": os.getenv("GEMINI_KEY"),
        "NEWS_NUMBER": os.getenv("NEWS_NUMBER"),
        "TTS_OUTPUT_DIR": os.getenv("TTS_OUTPUT_DIR", "/app/tts_output"),
        # 필요한 설정 추가 가능
    }
    _config_cache[env] = config
    return config
