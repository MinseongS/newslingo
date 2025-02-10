import google.generativeai as genai
from dotenv import load_dotenv
import os
import re

# 환경 변수 로드
load_dotenv("celery_app/configs/.env.local")

GEMINI_KEY = os.getenv("GEMINI_KEY")

genai.configure(api_key=GEMINI_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")


def translate_sentences_with_format(sentences):
    try:
        # 프롬프트에서 JSON 포맷으로 응답하도록 요청
        prompt = (
            "This is News Article.Translate the following sentences into Korean. "
            "Ensure that each English sentence is immediately followed by its Korean translation with a new line. "
            "Keep the order exactly as given and English first then Korean.\n\n"
            "Original Sentences:\n\n" + sentences
        )

        response = model.generate_content(contents=prompt)
        return response.text.strip()
    except Exception as e:
        raise Exception(f"Error in translate_sentences: {str(e)}")


def get_language_ratio(text, language_pattern):
    """주어진 텍스트에서 특정 언어의 비율을 계산하는 함수"""
    matches = re.findall(language_pattern, text)
    return len("".join(matches)) / max(len(text), 1)  # 0으로 나누는 것 방지


def is_english_allowed(text):
    english_ratio = get_language_ratio(text, r"[A-Za-z0-9.,'\"!?()\- ]")
    return english_ratio >= 0.30  # 90% 이상 영어면 정상 처리


def is_korean_allowed(text):
    korean_ratio = get_language_ratio(text, r"[가-힣\s.,'\"!?()\-]")
    return korean_ratio >= 0.30  # 90% 이상 한글이면 정상 처리


def llm_translate_news(article_text):
    try:
        translated_sentences = translate_sentences_with_format(article_text)

        english_sentences = ""
        korean_sentences = ""
        paragraphs = translated_sentences.split("\n\n\n")

        for paragraph in paragraphs:
            sentences_set = paragraph.split("\n\n")
            for sentences in sentences_set:
                sentence = sentences.split("\n")
                if len(sentence) < 2:
                    raise ValueError(
                        f"Invalid translation format: {translated_sentences}"
                    )

                eng_text, kor_text = sentence[0].strip(), sentence[1].strip()

                if not is_english_allowed(eng_text) or not is_korean_allowed(kor_text):
                    raise ValueError(
                        f"Invalid translation pair (too much foreign language): '{eng_text}' / '{kor_text}'"
                    )

                english_sentences += eng_text + "\n"
                korean_sentences += kor_text + "\n"

            english_sentences += "\n"
            korean_sentences += "\n"

        return {"english": english_sentences, "korean": korean_sentences}
    except Exception as e:
        # raise Exception(f"Error in llm_translate_news: {str(e)}")
        print(f"Error in llm_translate_news: {str(e)}")
        return {"english": "", "korean": ""}
