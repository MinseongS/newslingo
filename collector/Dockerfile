FROM python:3.12

WORKDIR /app

ENV TZ=Asia/Seoul
RUN ln -sf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

COPY requirements.txt .

RUN python -m pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENTRYPOINT ["/usr/bin/dumb-init", "--", "celery", "-A", "celery-app.scheduler"]
CMD ["worker", "--loglevel=info", "-f", "/app/log/worker.log"]
