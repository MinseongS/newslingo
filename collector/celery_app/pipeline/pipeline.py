from celery_app.configs.logging_config import get_logger

log = get_logger("pipeline")


class TextPipeline:
    def __init__(
        self,
        collector,
        translator,
        tts_converter,
        classifier,
        saver,
    ):
        self.collector = collector
        self.translator = translator
        self.tts_converter = tts_converter
        self.classifier = classifier
        self.saver = saver

    def run(self):
        items = self.collector.collect()
        log.info(f"Collected {len(items)} items.")

        for item in items:
            news_id = item["news_url"].split("id=")[-1]
            item["news_id"] = news_id
            print(news_id)
            # DB에 이미 존재하는지 확인
            if self.saver.exists(news_id):
                log.info(f"Skipping already existing news_id: {news_id}")
                continue

            log.info(f"Processing news_id: {news_id}")
            translated_item = self.translator.translate(item)
            tts_item = self.tts_converter.convert(translated_item)
            category_item = self.classifier.classify(tts_item)
            self.saver.save(category_item)
            log.info(f"Finished processing news_id: {news_id}")
