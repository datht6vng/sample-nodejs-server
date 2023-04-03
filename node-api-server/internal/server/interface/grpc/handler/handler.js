const { newErrorHandler } = require("../../../util/error/error_handler");

const { BaseError } = require("../../../entity/error/base_error");


class Handler {
    success(data, callback, message="Success", httpStatusCode=200) {
        console.log(data)
        const response = {
            data: data,
            message: message,
            status: httpStatusCode
        }
        callback(null, response);
    }

    failure(error, callback) {
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
}

function newHandler() {
    return new Handler;
}

module.exports.newHandler = newHandler;
module.exports.Handler = Handler;
