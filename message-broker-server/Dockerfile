FROM rabbitmq:management-alpine

RUN rabbitmq-plugins enable rabbitmq_management
RUN rabbitmq-plugins enable rabbitmq_mqtt

EXPOSE 15672
EXPOSE 1883
EXPOSE 5672
