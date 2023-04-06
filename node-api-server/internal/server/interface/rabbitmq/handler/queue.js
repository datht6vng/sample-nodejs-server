const { newQueueParams } = require("./queue_params");

class Queue {
    contructor(name, binding_keys, params=newQueueParams()) {
        this.name = name;
        this.bindingKeys = binding_keys;
        this.params = params;
    }
}

function newQueue(name, binding_keys, params=newQueueParams()) {
    return new Queue(name, binding_keys, params);
}

module.exports.newQueue = newQueue;
