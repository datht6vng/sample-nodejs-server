const { ExchangeType } = require("./exchange_type");

class Exchange {
    constructor(name, typ=ExchangeType.DEFAULT) {
        this.name = name;
        this.typ = type;
    }
}

function newExchange(name, typ=ExchangeType.DEFAULT) {
    return new Exchange(name, typ);
}

module.exports.newExchange = newExchange;
