FROM node:20.18.0

WORKDIR /app

COPY package.json .
COPY package-lock.json .
RUN npm install

COPY . /app
RUN npx prisma generate
RUN npm run build

# nginx 설치
RUN apt-get update && apt-get install -y nginx

# nginx 설정 복사
COPY nginx.conf /etc/nginx/nginx.conf

# Next.js는 3000, nginx는 80
EXPOSE 80 3000

# nginx 로그를 표준출력으로
RUN ln -sf /dev/stdout /var/log/nginx/access.log && \
    ln -sf /dev/stderr /var/log/nginx/error.log

# 동시에 실행
CMD ["sh", "-c", "nginx -g 'daemon off;' & npm run start"]