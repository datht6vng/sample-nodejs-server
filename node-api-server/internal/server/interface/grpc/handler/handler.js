const { newErrorHandler } = require("../../../error/error_handler");

const { BaseError } = require("../../../entity/error/base_error");

const { newFromProtobufConverter } = require("../../../data_converter/from_protobuf_converter");
const { newToProtobufConverter } = require("../../../data_converter/to_protobuf_converter");

class Handler {

    constructor() {
        this.fromProtobufConverter = newFromProtobufConverter()
        this.toProtobufConverter = newToProtobufConverter();
    }

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
        console.log(error)
        if (error instanceof BaseError) {
            const errorHandler = newErrorHandler();
            errorHandler.execute(error);
            const response = errorHandler.getMessage(error);
            callback(response);
        }
        else {
            // Instance of original Error
        }
    }
}

function newHandler() {
    return new Handler;
}

module.exports.newHandler = newHandler;
module.exports.Handler = Handler;
