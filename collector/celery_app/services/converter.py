from gtts import gTTS
import os
from celery_app.configs.logging_config import get_logger

log = get_logger(__name__)


class TTSConverter:
    def __init__(self, output_dir="tts_output"):
        self.output_dir = output_dir
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)

    def convert(self, item):
        news_id = item.get("news_id")
        if not news_id:
            log.error("news_id not found in item")
            return item

        article_tts_dir = os.path.join(self.output_dir, news_id)
        if not os.path.exists(article_tts_dir):
            os.makedirs(article_tts_dir)

        # 전체 기사 TTS
        full_text = item.get("translated_content", {}).get("english")
        if full_text:
            full_tts_path = os.path.join(article_tts_dir, "full.mp3")
            try:
                tts = gTTS(text=full_text, lang="en")
                tts.save(full_tts_path)
                item["full_text_audio_path"] = full_tts_path
            except Exception as e:
                log.error(f"Error creating full text TTS for {news_id}: {e}")
                item["full_text_audio_path"] = None
        else:
            log.warning(f"No english content found for full TTS in {news_id}")
            item["full_text_audio_path"] = None

        # 문장별 TTS
        sentences = item.get("sentences", [])
        if not sentences:
            log.warning(f"No sentences found for sentence-by-sentence TTS in {news_id}")

        for i, sentence_pair in enumerate(sentences):
            original_sentence = sentence_pair.get("english")
            if original_sentence:
                sentence_tts_path = os.path.join(article_tts_dir, f"sentence_{i}.mp3")
                try:
                    tts = gTTS(text=original_sentence, lang="en")
                    tts.save(sentence_tts_path)
                    sentence_pair["audio_path"] = sentence_tts_path
                except Exception as e:
                    log.error(
                        f"Error creating sentence TTS for {news_id}, sentence {i}: {e}"
                    )
                    sentence_pair["audio_path"] = None
            else:
                sentence_pair["audio_path"] = None

        # 'sentences' 키는 이미 item 딕셔너리 안에 참조로 존재하므로,
        # sentence_pair에 audio_path를 추가하면 item에 자동 반영됩니다.
        return item
