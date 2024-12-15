FROM node:20.18.0 as build-stage

WORKDIR /app

COPY package.json .
COPY package-lock.json .
# COPY yarn.lock .
RUN npm install 

# copy source
COPY . /app
RUN npx prisma generate
# build 
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]