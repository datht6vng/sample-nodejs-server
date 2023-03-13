const grpc = require("@grpc/grpc-js");
const grpcStatus = grpc.status;
const httpStatus = require("http-status");


function grpcToHttpStatusMapper(status) {
    let grpcToHttp = {};
    grpcToHttp[grpcStatus.NOT_FOUND] = httpStatus.NOT_FOUND;
    grpcToHttp[grpcStatus.INTERNAL] = httpStatus.INTERNAL_SERVER_ERROR;
    
    return grpcToHttp[status] ? grpcToHttp[status] : httpStatus.INTERNAL_SERVER_ERROR;
}

class GrpcService {

}

GrpcService.prototype.handleResponse = function(success, failure) {
    const inner = function(err, response) {
        if (err) failure(grpcToHttpStatusMapper(err.code), err.details);
        success(response.status, response.message, response.data);
    }
    return inner;
}

module.exports.GrpcService = GrpcService;
