FROM node:18-alpine

WORKDIR /usr/src/app/server

RUN apk add ca-certificates

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5001