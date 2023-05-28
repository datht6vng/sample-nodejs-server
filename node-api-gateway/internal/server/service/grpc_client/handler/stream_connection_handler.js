const { GrpcHandler } = require("./grpc_handler");

const { config } = require("../../../../../pkg/config/config");

const apiServerConfig = config.api_server;
const defaultProtoFile = "stream_connection.proto";
const defaultServiceName = "StreamConnectionService";
const defaultTargetHost = apiServerConfig.grpc.host;
const defaultTargetPort = apiServerConfig.grpc.port;

class StreamConnectionHandler extends GrpcHandler {
    constructor(protoFile=defaultProtoFile, serviceName=defaultServiceName, targetHost=defaultTargetHost, targetPort=defaultTargetPort) {
        super(protoFile, serviceName, targetHost, targetPort);    
    }

    forceConnect(arg, success, failure) {
        this.clientStuff.forceConnect(arg, this.handleResponse(success, failure));
    }
    
    forceDisconnect(arg, success, failure) {
        this.clientStuff.forceDisconnect(arg, this.handleResponse(success, failure));
    }
}

function newStreamConnectionHandler() {
    return new StreamConnectionHandler();
}

module.exports.newStreamConnectionHandler = newStreamConnectionHandler;
