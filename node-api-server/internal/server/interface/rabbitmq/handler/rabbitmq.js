const { newRabbitMQConnection } = require("./rabbitmq_connection");


class RabbitMQ {
    
    async initConnection() {
        this.connection = await newRabbitMQConnection().init();
    }

    async initChannel() {
        this.channel = await this.connection.createChannel();
    }

    async initExchange(exchangeName, exchangeType, exchangeParams) {
        await this.channel.assertExchange(exchangeName, exchangeType, exchangeParams);
    }

    async initQueue(exchangeName, queueName, bindingKeys, queueParams) {
        const q = await this.channel.assertQueue(queueName, queueParams);
        for (const key of bindingKeys) {
            await this.channel.bindQueue(q.queue, exchangeName, key);
        }

    }
    
}

module.exports.RabbitMQ = RabbitMQ;
