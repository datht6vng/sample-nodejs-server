const httpStatus = require("http-status");
const grpc = require("@grpc/grpc-js");
const grpcStatus = grpc.status;

const { NotFoundError } = require("../entity/error/not_found_error");
const { InternalServerError } = require("../entity/error/internal_server_error");
const { logger } = require("../../../pkg/logger/logger");

class ErrorHandler {
    constructor() {

    }
}

ErrorHandler.prototype.execute = function(error) {
    logger.error(error.toString());

    
}

ErrorHandler.prototype.getMessage = function(error) {
    if (error.isOperationalError()) {
        return {
            code: this.getGrpcStatus(error),
            message: error.getDescription(),
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

