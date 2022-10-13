FROM node:alpine as builder
WORKDIR /service/app/server
COPY . .
RUN npm install

FROM alpine
ENV CONFIG_PATH="./configs/server.toml"
WORKDIR /service/app/server
RUN  apk add --no-cache bash \
        \
        && apk add --no-cache tzdata \
        \
        && cp /usr/share/zoneinfo/Asia/Ho_Chi_Minh /etc/localtime \
        \
        && echo "Asia/Ho_Chi_Minh" > /etc/timezone

RUN apk --no-cache add ca-certificates && apk --no-cache add curl
COPY --from=builder /service/app/server/configs /configs

CMD ["node", "cmd/server/main.js"]