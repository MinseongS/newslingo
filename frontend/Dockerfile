FROM node:22.3.0 as build-stage

WORKDIR /app

COPY package.json .
# COPY yarn.lock .
RUN npm install 

# copy source
COPY . /app

# build 
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]