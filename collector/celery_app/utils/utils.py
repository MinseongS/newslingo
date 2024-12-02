import re


def split_paragraphs(text):
    text = normalize_newlines(text)
    paragraphs = [para.strip() for para in text.split("\n\n") if para.strip()]
    return paragraphs


def validate_paragraphs(english_text, korean_text):
    english_paragraphs = split_paragraphs(english_text)
    korean_paragraphs = split_paragraphs(korean_text)

    if len(english_paragraphs) != len(korean_paragraphs):
        return False
    return True


def normalize_newlines(text):
    return text.replace("\r\n", "\n").replace("\r", "\n")


def calculate_korean_percentage(text):
    korean_characters = re.compile(r"[가-힣]")

    total_characters = len([char for char in text if char.strip()])
    korean_count = len(korean_characters.findall(text))

    if total_characters == 0:
        return 0

    return (korean_count / total_characters) * 100
