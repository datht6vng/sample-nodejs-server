FROM node:18-alpine

WORKDIR /service/hcmut-thesis/node-api-server

COPY . .
COPY ./config /config


RUN npm install

RUN  apk add --no-cache bash \
        \
        && apk add --no-cache tzdata \
        \
        && cp /usr/share/zoneinfo/Asia/Ho_Chi_Minh /etc/localtime \
        \
        && echo "Asia/Ho_Chi_Minh" > /etc/timezone

RUN apk --no-cache add ca-certificates && apk --no-cache add curl

ENV CONFIG_PATH="/config/node-api-server.toml" 
ENV BROKER_HOST="rabbitmq"

RUN npm install -g pkg
RUN pkg package.json --targets node18-alpine

ENTRYPOINT [ "./node-api-server" ]