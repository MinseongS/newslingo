class BaseCollector:
    def collect(self):
        raise NotImplementedError


class BaseTranslator:
    def translate(self, text):
        raise NotImplementedError


class BaseClassifier:
    def classify(self, text):
        raise NotImplementedError


class BaseSaver:
    def save(self, data):
        raise NotImplementedError


class BaseTTS:
    def synthesize(self, text):
        raise NotImplementedError


class BaseQuestionGenerator:
    def generate(self, text):
        raise NotImplementedError
