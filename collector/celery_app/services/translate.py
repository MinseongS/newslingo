# from google.cloud import translate_v2 as translate
import os
import json
import requests
from googletrans import Translator


def googletrans_translate(text, source_lang, target_lang):
  translator = Translator()
  translated_text = translator.translate(text, src=source_lang, dest=target_lang)
  return translated_text