
const { newProtoLoader } = require("../../../../pkg/grpc/proto/proto_loader");

const { newToProtobufConverter } = require("../../data_converter/to_protobuf_converter");
const { newFromProtobufConverter } = require("../../data_converter/from_protobuf_converter");

const { newErrorHandler } = require("../../error/error_handler");
const { newBaseError } = require("../../entity/error/base_error");

class GrpcHandler {
    constructor(protoFile, serviceName, targetHost, targetPort, protoLoader=newProtoLoader()) {
        this.protoLoader = protoLoader;
        this.protoFile = protoFile;
        this.serviceName = serviceName;
        this.targetHost = targetHost;
        this.targetPort = targetPort;
        this.clientStuff = this.protoLoader.getClientStub(this.protoFile, this.serviceName, this.targetHost, this.targetPort);
    
        
        this.toProtobufConverter = newToProtobufConverter();
        this.fromProtobufConverter = newFromProtobufConverter();
    
    }

    async callRpc(rpcMethod, arg) {
        rpcMethod = rpcMethod.bind(this.clientStuff); // make sure rpc method is linked to clientStuff
        return new Promise((resolve, reject) => {
            rpcMethod(arg, (err, response) => {
                if (err) {
                    reject(err);
                } 
                else {
                    resolve(response);
                }
            });
        });
    }

    handleError(err, message) {
        // const handler = newErrorHandler();
        err = newBaseError("", message, true);
        // handler.execute(err);
        throw err;
    }
}

module.exports.GrpcHandler = GrpcHandler;
