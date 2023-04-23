const { newAMQPPublisher } = require("./handler/amqp_publisher");

class Producer {
    constructor(exchange, queue) {
        this.publisher = newAMQPPublisher(exchange, queue);
    }

    produceMessage(routingKey, body) {
        this.publisher.publish(routingKey, body);
    }
}

function newProducer(exchange, queue) {
    return new Producer(exchange, queue);
}

module.exports.newProducer = newProducer;
