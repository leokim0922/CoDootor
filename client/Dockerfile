FROM node:18-alpine

WORKDIR /usr/src/app/frontend

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173