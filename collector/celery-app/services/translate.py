# from google.cloud import translate_v2 as translate
import os
import json
import requests
import google.generativeai as genai

# os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = "./google_key.json"

# client = translate.Client()


# def google_translate(text, language):
#     try:
#         result = client.translate(text, language)
#         return result["translatedText"]
#         # return "안녕하세요"
#     except Exception as e:
#         print("데이터 번역 중 오류가 발생했습니다:", str(e))


# def naver_translate(text, source_lang, target_lang):
#     url = "https://openapi.naver.com/v1/papago/n2mt"

#     client_id = "9LMnEDdHX6fh15BtM218"
#     client_secret = "eri0kTOri8"

#     encText = urllib.parse.quote(text)
#     data = f"source={source_lang}&target={target_lang}&text=" + encText
#     request = urllib.request.Request(url)
#     request.add_header("X-Naver-Client-Id", client_id)
#     request.add_header("X-Naver-Client-Secret", client_secret)
#     response = urllib.request.urlopen(request, data=data.encode("utf-8"))
#     rescode = response.getcode()
#     if (rescode == 200):
#         response_body = response.read()
#         translated = json.loads(response_body.decode(
#             'utf-8'))["message"]["result"]["translatedText"]
#         return translated
#     else:
#         print("Error Code:" + rescode)


def papago_translate(text, source_lang, target_lang):
    with open('config.json', 'r') as f:
        config = json.load(f)

    url = config["translate"]["url"]
    headers = {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-NCP-APIGW-API-KEY-ID": config["translate"]["X-NCP-APIGW-API-KEY-ID"],
        "X-NCP-APIGW-API-KEY": config["translate"]["X-NCP-APIGW-API-KEY"]
    }
    data = {
        "source": source_lang,
        "target": target_lang,
        "text": text,
    }

    if target_lang in ["ko", "ja"]:
        data["honorific"] = True

    response = requests.post(url, headers=headers, data=data)
    result = response.json()
    translated_text = result["message"]["result"]["translatedText"]
    return translated_text


"""
At the command line, only need to run once to install the package via pip:

$ pip install google-generativeai
"""


genai.configure(api_key="AIzaSyAB3z1LbPRGGJ1m_AN-u8EKpbrDZFSfRjM")

# Set up the model
generation_config = {
  "temperature": 0.9,
  "top_p": 1,
  "top_k": 1,
  "max_output_tokens": 2048,
}

safety_settings = [
  {
    "category": "HARM_CATEGORY_HARASSMENT",
    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
  },
  {
    "category": "HARM_CATEGORY_HATE_SPEECH",
    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
  },
  {
    "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
  },
  {
    "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
  },
]


def gemini_translate(text, source_lang):
    model = genai.GenerativeModel(model_name="gemini-pro",
                                generation_config=generation_config,
                                safety_settings=safety_settings)

    prompt_parts = [
    f"{source_lang} news {text}",
    "한국어 뉴스, 한국 뉴스 기사 말투 ",
    ]

    response = model.generate_content(prompt_parts)
    print(response.text)
    return response.text
