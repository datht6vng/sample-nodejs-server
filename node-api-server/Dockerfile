FROM node:alpine
WORKDIR /usr/apps

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

ENV CONFIG_PATH="./config/server.toml"

CMD ["npm", "run", "dev"]
