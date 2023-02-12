const httpStatus = require("http-status");
const grpc = require("@grpc/grpc-js");
const grpcStatus = grpc.status;

const { NotFoundError } = require("../../entity/error/not_found_error");
const { InternalServerError } = require("../../entity/error/internal_server_error");


class ErrorHandler {
    constructor() {

    }
}

ErrorHandler.prototype.execute = function(error) {
    return this.getMessage(error);
}

ErrorHandler.prototype.getMessage = function(error) {
    if (error.isOperational()) {
        return {
            code: this.getHttpStatus(error),
            message: error.getDescription()
        }
    }

}

ErrorHandler.prototype.getHttpStatus = function(error) {
    switch (error.constructor) {
        case NotFoundError:
            return httpStatus.NOT_FOUND;

        case InternalServerError:
            return httpStatus.INTERNAL_SERVER_ERROR;

    }

}

ErrorHandler.prototype.getGrpcStatus = function(error) {
    switch (error.constructor) {
        case NotFoundError:
            return grpcStatus.NOT_FOUND;

        case InternalServerError:
            return grpcStatus.INTERNAL;

    }
}



function newErrorHandler() {
    return new ErrorHandler()
}

module.exports.newErrorHandler = newErrorHandler;

