const RabbitMQ = require("./rabbitmq");

class AMQPPublisher extends RabbitMQ {
    constructor(exchange, queue) {
        this.exchange = exchange;
        this.queue = queue;
        super();
    }

    async publish(routingKey, body) {
        await this.initConnection();
        await this.initChannel();
        await this.initExchange(this.exchange.name, this.exchange.typ);
        await this.initQueue(this.exchange.name, this.queue.name, this.queue.bindingKeys, this.queue.params);

        this.channel.publish(this.exchange.name, routingKey, body);
    }
    

}

function newAMQPPublisher(exchange, queue) {
    return new AMQPPublisher(exchange, queue);
}

module.exports.newAMQPPublisher = newAMQPPublisher;
