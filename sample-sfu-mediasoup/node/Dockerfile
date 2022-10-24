FROM node:17-alpine3.12
WORKDIR /usr/code
COPY ./package.json .
RUN apk add g++ make python3 linux-headers
RUN apk add --update py3-pip
RUN apk add  --no-cache ffmpeg
RUN npm install
RUN sh -c "$(wget -O- https://github.com/deluan/zsh-in-docker/releases/download/v1.1.2/zsh-in-docker.sh)"
#RUN apk add  --no-cache gstreamer
# ENTRYPOINT ["tail", "-f", "/dev/null"]
# CMD [ "node", "app.js" ]
