FROM rabbitmq:3.8-management-alpine

RUN rabbitmq-plugins enable rabbitmq_management
RUN rabbitmq-plugins enable rabbitmq_mqtt

EXPOSE 15672
EXPOSE 1883
