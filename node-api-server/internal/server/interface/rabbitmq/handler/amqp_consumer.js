const { RabbitMQ } = require("./rabbitmq");


class AMQPConsumer extends RabbitMQ {
    constructor(exchange, queue, callback) {
        super();
        this.exchange = exchange; 
        this.queue = queue;
        this.callback = callback;
    }

    async start() {
        await this.initConnection();
        await this.initChannel();
        await this.initExchange(this.exchange.name, this.exchange.typ, this.exchange.params);
        await this.initQueue(this.exchange.name, this.queue.name, this.queue.bindingKeys, this.queue.params);
        // Temporarily set noAck to true
        this.channel.consume(this.queue.name, this.callback, { noAck: true });
    }

}

function newAMQPConsumer(exchange, queue, callback) {
    return new AMQPConsumer(exchange, queue, callback);
}

module.exports.newAMQPConsumer = newAMQPConsumer;
