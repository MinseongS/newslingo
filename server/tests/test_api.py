import requests

url = "http://localhost:8000/api"


def test_health():
    res = requests.get(f"{url}/healthz")
    assert res.status_code == 200


def test_inference():
    body = {"text": "한국어입니다."}
    res = requests.post(f"{url}/inference", json=body)
    result = res.json()
    assert res.status_code == 200
    assert result["label"] == "__label__ko"
