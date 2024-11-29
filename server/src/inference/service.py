import os
import urllib
from typing import Dict

import fasttext
from asyncer import asyncify

from utils.utils import Lazy

_data = Lazy()
MODEL_FILE = "fasttext.bin"


async def init_inference(_):
    # download model if model file is not exists
    if not os.path.isfile(MODEL_FILE):
        urllib.request.urlretrieve(
            "https://kr.object.ncloudstorage.com/ai-models/fasttext/fasttext.bin",
            MODEL_FILE,
        )
    _data.fasttext = fasttext.load_model(MODEL_FILE)


async def detect_language(text: str) -> Dict[str, str | float]:
    result = await asyncify(_data.fasttext.predict)(text)
    return {"label": result[0][0], "prob": result[1][0]}
