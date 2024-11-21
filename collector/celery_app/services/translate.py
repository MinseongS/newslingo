from googletrans import Translator


def googletrans_translate(text, source_lang, target_lang):
    translator = Translator()
    translated_text = translator.translate(text, src=source_lang, dest=target_lang)
    return translated_text


if __name__ == "__main__":
    main_translator = Translator()
    traslated_text = main_translator.translate("hello", src="ko", dest="en")
    print(traslated_text)
