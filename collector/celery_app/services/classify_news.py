import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv("celery_app/configs/.env.local")

GEMINI_KEY = os.getenv("GEMINI_KEY")

genai.configure(api_key=GEMINI_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")

PREDEFINED_CATEGORIES = [
    "Finance",
    "Technology",
    "Social",
    "Sports",
    "Entertainment",
    "Politics",
    "Weather",
]


def classify_news(article_text):
    try:
        # 모델에 제공할 메시지 작성
        predefined_categories_text = ", ".join(PREDEFINED_CATEGORIES)
        prompt = (
            f"Classify the following article into one of the predefined categories: "
            f"{predefined_categories_text}. "
            f"Provide exactly one category, and nothing else.\n\n"
            f"Article: {article_text}"
        )

        # Gemini API 호출
        response = model.generate_content(
            contents=prompt,
        )

        # 모델 응답에서 카테고리 추출
        raw_category = response.text.strip()
        print("classify category :" + raw_category)

        # 응답이 사전 정의된 카테고리에 포함되는지 확인
        if raw_category in PREDEFINED_CATEGORIES:
            return {"category": raw_category}
        else:
            return {"category": "ETC"}
    except Exception as e:
        raise Exception(f"Error in classify_news: {str(e)}")
