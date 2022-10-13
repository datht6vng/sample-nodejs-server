FROM node:alpine as builder
WORKDIR /server
COPY . .
RUN npm install

FROM alpine


ENV CONFIG_PATH="./configs/server.toml"