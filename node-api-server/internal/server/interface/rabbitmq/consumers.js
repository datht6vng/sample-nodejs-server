const { config } = require("../../../../pkg/config/config");
const { newAMQPConsumer } = require("./handler/amqp_consumer");
const { newCallbackContext } = require("./callback_context");
const { newExchange } = require("./handler/exchange");
const { newQueue } = require("./handler/queue");

const brokerConfig = config.rabbitmq;
const defaultExchanges = brokerConfig.exchanges;

class Consumers {
    constructor(exchanges=defaultExchanges) {
        this.consumers = new Array();
        this.exchanges = exchanges;
    }

    start() {
        const callbackContext = newCallbackContext();
        Object.values(this.exchanges).forEach(exchange => {
            Object.values(exchange.queues).forEach(queue => {
                const callbackObj = callbackContext.getEventCallback(exchange.name, queue.name);
                if (callbackObj) {
                    const argExchange = newExchange(exchange.name);
                    const argQueue = newQueue(queue.name, queue.binding_keys);
                    const consumer = newAMQPConsumer(argExchange, argQueue, callbackFunc);
                    this.consumers.push(consumer);
                    this.consumer.start();
                }
            })
        })


        // for (let exchange in this.exchanges) {
        //     for (let queue of exchange.queues) {
        //         const callbackObj = callbackContext.getEventCallback(exchange.name, queue.name);
        //         if (callbackObj) {
        //             const argExchange = newExchange(exchange.name);
        //             const argQueue = newQueue(queue.name, queue.binding_keys);
        //             const consumer = newAMQPConsumer(argExchange, argQueue, callbackFunc);
        //             this.consumers.push(consumer);
        //             this.consumer.start();
        //         }
        //     }
        // }
    }
}

function newConsumers(exchanges=defaultExchanges) {
    return new Consumers(exchanges);
}

module.exports.newConsumers = newConsumers;
