const { ExchangeType } = require("./exchange_type");
const { newExchangeParams } = require("./exchange_params");

class Exchange {
    constructor(name, typ=ExchangeType.DEFAULT, params=newExchangeParams()) {
        this.name = name;
        this.typ = typ;
        this.params = params;
    }
}

function newExchange(name, typ=ExchangeType.DEFAULT, params=newExchangeParams()) {
    return new Exchange(name, typ, params);
}

module.exports.newExchange = newExchange;
