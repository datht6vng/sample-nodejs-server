const { BaseError } = require("./base_error");

class NotFoundError extends BaseError {
    constructor(name='', description='', isOperational=true) {
        super(name, description, isOperational, httpStatusCode);
    }
}

function newNotFoundError(name, description='', isOperational=true) {
    return new NotFoundError(name, description, isOperational);
}

module.exports.NotFoundError = NotFoundError;
module.exports.newNotFoundError = newNotFoundError;
