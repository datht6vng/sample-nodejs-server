class QueueParams {

    constructor(durable=true, auto_delete=false,  exclusive=false) {
        // this.durable = durable
        // this.auto_delete = auto_delete
        this.exclusive = exclusive
    }
}

function newQueueParams(durable=true, auto_delete=false,  exclusive=false) {
    return new QueueParams();
}

module.exports.newQueueParams = newQueueParams;
