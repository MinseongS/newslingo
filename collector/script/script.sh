docker run --name redis-server -p 6379:6379 -d redis
docker run -d --name rabbitmq-server -p 5672:5672 -p 15672:15672 rabbitmq:3-management
