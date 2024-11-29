# AI-Inference-Server
AI 추론서버 개발을 위한 간단한 프로젝트 템플릿입니다.  
AI 개발자분들이 빠르게 개발하시기 위해서 최대한 간단하게 구성하였습니다.

## Project Structure
- dockerfiles/Dockerfile: 추론 서버 Dockerize를 위한 도커파일
- skaffold.yaml:
- requirements.txt: 패키지 목록
- run.py: 추론 서버의 entrypoint
- services: API들이 정의되어 있는 서비스 폴더
    - \_\_init__.py: 서버가 시작되면서 맨 처음 실행되는 부분
    - health.py: 서버의 health check를 위한 API
    - inference.py: 추론 API
    - sleep.py: 비동기 예시를 위한 sleep API
    - utils.py: util 성격의 함수 정의
```bash
├── README.md
├── build.sh
├── dockerfiles
│   └── Dockerfile
├── requirements.txt
├── run.py
└── services
    ├── __init__.py
    ├── health.py
    ├── inference.py
    ├── sleep.py
    └── utils.py
```
## QuickStart
> Linux 환경 권장. Mac이나 Window에선 일부 패키지 설치가 잘 안될 수 있음.
### Install Poetry
패키지 매니저를 Pip 대신 [Poetry](https://python-poetry.org/docs/)를 사용하고 있습니다.
```bash
curl -sSL https://install.python-poetry.org | python3 -
```
### Run Server
```bash
poetry install
python run.py
```
### Test 
아래 명령어로 테스트할 수 있고, 브라우저에서 `localhost:8000/docs`에 접속하여 테스트하실 수 있습니다.
```bash
curl localhost:8000/api/v1/healthz
curl -X POST -H 'Content-Type: application/json' localhost:8000/api/v1/inference -d '{"text": "hello"}'
```
![swagger](/imgs/swagger.png)

## Config
`local.cfg`는 로컬에서 실행될 때 사용될 값, `kube.cfg`는 배포됐을 때 사용될 값을 의미합니다. 예를 들어, 로컬에선 크기가 작은 모델, 배포 환경에선 큰 모델을 사용해야 하는 경우 각 cfg파일에 해당하는 모델 이름을 적어주고 코드에서 사용하도록 합니다. 이렇게 하면 코드 변경없이 환경에 따라 설정을 달리할 수 있습니다.   
다만 숫자를 사용할 때, 불러오는 과정에서 str 타입으로 변경되므로, 코드에서 명시적으로 int 변환해서 사용해야 합니다.

## 비동기
일반적으로 모델 추론 코드는 비동기를 지원하지 않기 때문에, `asyncer` 패키지를 통해서 비동기 함수로 바꿔주고 있습니다. 템플릿에서 sleep API가 동기 함수인 sleep을 비동기 함수로 변경하는 예시입니다.   
아래와 같이 `asyncify(함수)(매개변수)` 형태로 작성하기만 하면 자동으로 비동기 함수로 변경됩니다.   
비동기를 적용 유무에 따른 성능 차이는 크지 않지만, 추론 서버의 상태를 확인하는 health API가 추론 도중에도 동작할 수 있도록 하기위해 비동기 사용을 권장하고 있습니다.
```python
from asyncer import asyncify
import time

async sleep_async():
    await asyncify(time.sleep)(5)
```

## Poetry Usage
poetry로 패키지를 설치하면 자동으로 버전이 픽스가 되어 의존성 관리가 훨씬 수월합니다.   
- pyproject.toml에 있는 모든 패키지 한번에 설치. `pip install -r requirements.txt` 와 동일
    ```bash
    poetry install
    ```
- 특정 패키지 설치
    ```bash
    poetry add fastapi
    # git에서 받는 경우에 pip와 동일한 방법으로 설치
    poetry add git+https://github.com/cfculhane/fastText
    ```