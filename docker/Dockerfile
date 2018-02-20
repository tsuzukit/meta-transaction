FROM node:9.4.0-alpine

WORKDIR /usr/repo

RUN apk update && apk add git python make g++

RUN npm install

ENTRYPOINT tail -f /dev/null