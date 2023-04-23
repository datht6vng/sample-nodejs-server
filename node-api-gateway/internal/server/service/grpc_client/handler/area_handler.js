const { GrpcHandler } = require("./grpc_handler");

const { config } = require("../../../../../pkg/config/config");

const apiServerConfig = config.api_server;
const defaultProtoFile = "area.proto";
const defaultServiceName = "AreaService";
const defaultTargetHost = apiServerConfig.grpc.host;
const defaultTargetPort = apiServerConfig.grpc.port;

class AreaHandler extends GrpcHandler {
    constructor(protoFile=defaultProtoFile, serviceName=defaultServiceName, targetHost=defaultTargetHost, targetPort=defaultTargetPort) {
        super(protoFile, serviceName, targetHost, targetPort);    
    }

    getAllAreas(arg, success, failure) {
        this.clientStuff.getAllAreas(arg, this.handleResponse(success, failure));
    }
    
    createArea(arg, success, failure) {
        this.clientStuff.createArea(arg, this.handleResponse(success, failure));
    }

    getAreaById(arg, success, failure) {
        this.clientStuff.getAreaById(arg, this.handleResponse(success, failure));
    }

    updateAreaById(arg, success, failure) {
        this.clientStuff.updateAreaById(arg, this.handleResponse(success, failure));
    }

    deleteAreaById(arg, success, failure) {
        this.clientStuff.deleteAreaById(arg, this.handleResponse(success, failure));
    }
    
    getAllAreasByType(arg, success, failure) {
        this.clientStuff.getAllAreasByType(arg, this.handleResponse(success, failure));
    }
}

function newAreaHandler() {
    return new AreaHandler();
}

module.exports.newAreaHandler = newAreaHandler;
