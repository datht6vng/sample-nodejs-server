const { newQueueParams } = require("./queue_params");

class Queue {
    contructor(name, bindingKeys, params=newQueueParams()) {
        this.name = name;
        this.bindingKeys = bindingKeys;
        this.params = params;
    }
}

function newQueue(name, bindingKeys, params=newQueueParams()) {
    return new Queue(name, bindingKeys, params);
}

module.exports.newQueue = newQueue;
