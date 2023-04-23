const { newProtoLoader } = require("../../../../../pkg/grpc/proto/proto_loader");

const grpc = require("@grpc/grpc-js");
const grpcStatus = grpc.status;
const httpStatus = require("http-status");

function grpcToHttpStatusMapper(status) {
    let grpcToHttp = {};
    grpcToHttp[grpcStatus.NOT_FOUND] = httpStatus.NOT_FOUND;
    grpcToHttp[grpcStatus.INTERNAL] = httpStatus.INTERNAL_SERVER_ERROR;
    
    return grpcToHttp[status] ? grpcToHttp[status] : httpStatus.INTERNAL_SERVER_ERROR;
}

class GrpcHandler {

    constructor(protoFile, serviceName, targetHost, targetPort, protoLoader=newProtoLoader()) {
        this.protoLoader = protoLoader;
        this.protoFile = protoFile;
        this.serviceName = serviceName;
        this.targetHost = targetHost;
        this.targetPort = targetPort;
        this.clientStuff = this.protoLoader.getClientStub(this.protoFile, this.serviceName, this.targetHost, this.targetPort);    
    }



    handleResponse(success, failure) {
        const inner = function(err, response) {
            if (err) failure(grpcToHttpStatusMapper(err.code), err.details);
            else success(response.status, response.message, response.data);
        }
        return inner;
    }
}



module.exports.GrpcHandler = GrpcHandler;
