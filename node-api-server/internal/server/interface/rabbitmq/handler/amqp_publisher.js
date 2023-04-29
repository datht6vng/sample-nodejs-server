const { RabbitMQ } = require("./rabbitmq");

class AMQPPublisher extends RabbitMQ {
    constructor(exchange, queue) {
        super();
        this.exchange = exchange;
        this.queue = queue;
    }

    async publish(routingKey, body) {
        await this.initConnection();
        await this.initChannel();
        await this.initExchange(this.exchange.name, this.exchange.typ, this.exchange.params);
        await this.initQueue(this.exchange.name, this.queue.name, this.queue.bindingKeys, this.queue.params);

        this.channel.publish(this.exchange.name, routingKey, body);
    }
    

}

function newAMQPPublisher(exchange, queue) {
    return new AMQPPublisher(exchange, queue);
}

module.exports.newAMQPPublisher = newAMQPPublisher;
