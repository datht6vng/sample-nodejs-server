const RabbitMQ = require("./rabbitmq");


class AMQPConsumer extends RabbitMQ {
    constructor(exchange, queue, callback) {
        this.init(exchange, queue, callback);
    }

    async init(exchange, queue) {
        await this.initConnection();
        await this.initChannel();
        await this.initExchange(exchange.name, exchange.typ);
        await this.initQueue(exchange.name, queue.name, queue.bindingKeys, queue.params);
    }

}
