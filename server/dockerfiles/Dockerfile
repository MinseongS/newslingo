FROM python:3.11-slim as requirements-stage

WORKDIR /tmp

RUN pip install poetry poetry-plugin-export

COPY pyproject.toml poetry.lock /tmp/

RUN poetry export -f requirements.txt --output requirements.txt --without-hashes --without dev

FROM python:3.11-slim

WORKDIR /code

RUN apt-get -y update; \
    apt-get install -yqq git build-essential libsndfile1; \
    rm -rf /var/lib/apt/lists/*

COPY --from=requirements-stage /tmp/requirements.txt /code/requirements.txt

RUN pip3 install --no-cache-dir --upgrade -r /code/requirements.txt

COPY src/ /code/

EXPOSE 8000

ENTRYPOINT ["python", "run.py"]