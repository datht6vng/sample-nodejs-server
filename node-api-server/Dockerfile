FROM node:18-alpine as builder

WORKDIR /service/hcmut-thesis/node-api-server

COPY . .

RUN npm install

RUN npm install -g pkg

RUN pkg package.json --targets node18-alpine

FROM alpine

WORKDIR /service/hcmut-thesis/node-api-server

RUN  apk add --no-cache bash \
        \
        && apk add --no-cache tzdata \
        \
        && cp /usr/share/zoneinfo/Asia/Ho_Chi_Minh /etc/localtime \
        \
        && echo "Asia/Ho_Chi_Minh" > /etc/timezone


RUN apk --no-cache add ca-certificates && apk --no-cache add curl

COPY ./config /config
COPY --from=builder /service/hcmut-thesis/node-api-server/node-api-server .
COPY --from=builder /service/hcmut-thesis/node-api-server/pkg/grpc ./pkg/grpc

ENV CONFIG_PATH="/config/node-api-server.toml" 
#ENV BROKER_HOST="rabbitmq"

ENTRYPOINT [ "./node-api-server" ]