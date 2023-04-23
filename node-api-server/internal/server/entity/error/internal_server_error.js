const { BaseError } = require("./base_error");

class InternalServerError extends BaseError {
    constructor(name='', description='', isOperational=true) {
        super(name, description, isOperational);
    }
}

function newInternalServerError(name='', description='', isOperational=true) {
    return new InternalServerError(name, description, isOperational);
}

module.exports.InternalServerError = InternalServerError;
module.exports.newInternalServerError = newInternalServerError;
