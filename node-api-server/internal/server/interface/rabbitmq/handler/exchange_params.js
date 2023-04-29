class ExchangeParams {

    constructor(durable=true, auto_delete=false,  exclusive=false) {
        // this.durable = durable
        // this.auto_delete = auto_delete
        // this.exclusive = exclusive
        this.durable = durable;
    }
}

function newExchangeParams(durable=true, auto_delete=false,  exclusive=false) {
    return new ExchangeParams();
}

module.exports.newExchangeParams = newExchangeParams;
