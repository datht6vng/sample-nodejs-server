const { newErrorHandler } = require("../../../util/error/error_handler");

const { BaseError } = require("../../../entity/error/base_error");


class Handler {

}

Handler.prototype.success = function(data, callback, message="Success", httpStatusCode=200) {
    const response = {
        data: data,
        message: message,
        status: httpStatusCode
    }
    callback(null, response);
}

Handler.prototype.failure = function(error, callback) {
    if (error instanceof BaseError) {
        const errorHandler = newErrorHandler();
        errorHandler.execute(error);
        const response = errorHandler.getMessage(error);
        callback(response);
    }
    else {
        // Instance of original Error
        console.log(error);
    }
}

function newHandler() {
    return new Handler;
}

module.exports.newHandler = newHandler;
module.exports.Handler = Handler;
