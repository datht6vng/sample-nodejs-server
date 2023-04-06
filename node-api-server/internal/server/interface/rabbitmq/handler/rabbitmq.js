const { newRabbitMQConnection } = require("./rabbitmq_connection");


class RabbitMQ {
    
    async initConnection() {
        this.connection = await newRabbitMQConnection().init();
    }

    async initChannel() {
        this.channel = await this.connection.createChannel();
    }

    async initExchange(exchangeName, exchangeType) {
        await this.channel.assertExchange(exchangeName, exchangeType);
    }

    async initQueue(exchangeName, queueName, bindingKeys, queueParams) {
        await this.channel.assertQueue(queueName, queueParams);
        for (const key of bindingKeys) {
            await this.channel.bindQueue(queueName, exchangeName, key);
        }

    }
    
}

module.exports.RabbitMQ = RabbitMQ;
