import re


def split_paragraphs(text, delimiter="\n\n"):
    text = normalize_newlines(text)
    paragraphs = [para.strip() for para in text.split(delimiter) if para.strip()]
    return paragraphs


def validate_paragraphs(english_text, korean_text):
    english_paragraphs_by_double_newline = split_paragraphs(english_text, "\n\n")
    korean_paragraphs_by_double_newline = split_paragraphs(korean_text, "\n\n")

    english_paragraphs_by_single_newline = split_paragraphs(english_text, "\n")
    korean_paragraphs_by_single_newline = split_paragraphs(korean_text, "\n")

    if len(english_paragraphs_by_double_newline) != len(
        korean_paragraphs_by_double_newline
    ):
        return False

    if len(english_paragraphs_by_single_newline) != len(
        korean_paragraphs_by_single_newline
    ):
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
