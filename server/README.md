# Fastapi Server Template

## Project Structure
- dockerfiles/Dockerfile: 서버 Dockerize를 위한 도커파일
- skaffold.yaml: skaffold Tool 사용을 위한 yaml 파일
- helm: 쿠버네티스 배포를 위한 helm 차트. skaffold로 배포할 때 쓰임
- yamls: 업데이트가 필요없거나 하면 안되는 리소스 yaml 파일 모음
- pyproject.toml: 프로젝트 및 패키지 정보
- src/: 서버와 관련된 모든 코드가 있는 폴더. 도메인 별로 폴더가 있고 그 안에 필요한 파일들이 있음
    - health/: Health check 도메인
        - router.py: API 라우팅 정의
        - service.py: API 비즈니스 로직 정의
        - schemas.py: API request/response 스키마 정의
        - utils.py: 도메인의 유틸리티 모음
    - inference/: Inference 도메인
    - utils/: 유틸리티 도메인
- tests: pytest 코드가 있는 폴더 
```bash
├── .vscode
├── dockerfiles
│   └── Dockerfile
├── helm
│   ├── charts
│   ├── templates
│   ├── .helmignore
│   ├── Chart.yaml
│   └── values.yaml
├── src
├── tests
├── yamls
├── pyproject.toml
├── README.md
└── skaffold.yaml
```
## QuickStart
### Install Poetry
패키지 매니저를 Pip 대신 [Poetry](https://python-poetry.org/docs/)를 사용하고 있습니다.
```bash
curl -sSL https://install.python-poetry.org | python3 -
```
### Run Server
```bash
poetry install
python src/run.py
```
### Test 
Pytest 혹은 [Swagger UI](http://localhost:8000/docs)에 접속하여 테스트하실 수 있습니다.
```bash
pytest tests/ -s
```

## Config
`local.cfg`는 로컬에서 실행될 때 사용될 값, `kube.cfg`는 배포됐을 때 사용될 값을 의미합니다. 예를 들어, 로컬에선 크기가 작은 모델, 배포 환경에선 큰 모델을 사용해야 하는 경우 각 cfg파일에 해당하는 모델 이름을 적어주고 코드에서 사용하도록 합니다. 이렇게 하면 코드 변경없이 환경에 따라 설정을 달리할 수 있습니다.   
다만 숫자를 사용할 때, 불러오는 과정에서 str 타입으로 변경되므로, 코드에서 명시적으로 int 변환해서 사용해야 합니다.

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