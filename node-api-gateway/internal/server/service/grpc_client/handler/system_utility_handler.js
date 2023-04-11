const { GrpcHandler } = require("./grpc_handler");

const { config } = require("../../../../../pkg/config/config");

const apiServerConfig = config.api_server;
const defaultProtoFile = "system_utility.proto";
const defaultServiceName = "SystemUtilityService";
const defaultTargetHost = apiServerConfig.grpc.host;
const defaultTargetPort = apiServerConfig.grpc.port;

class SystemUtilityHandler extends GrpcHandler {
    constructor(protoFile=defaultProtoFile, serviceName=defaultServiceName, targetHost=defaultTargetHost, targetPort=defaultTargetPort) {
        super(protoFile, serviceName, targetHost, targetPort);    
    }

    crudAllMapUtils(arg, success, failure) {
        this.clientStuff.crudAllMapUtils(arg, this.handleResponse(success, failure));
    }
    
}

function newSystemUtilityHandler() {
    return new SystemUtilityHandler();
}

module.exports.newSystemUtilityHandler = newSystemUtilityHandler;
