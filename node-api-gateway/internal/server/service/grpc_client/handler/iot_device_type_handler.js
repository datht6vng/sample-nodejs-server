const { GrpcHandler } = require("./grpc_handler");

const { config } = require("../../../../../pkg/config/config");

const apiServerConfig = config.api_server;
const defaultProtoFile = "iot_device_type.proto";
const defaultServiceName = "IotDeviceTypeService";
const defaultTargetHost = apiServerConfig.grpc.host;
const defaultTargetPort = apiServerConfig.grpc.port;

class IotDeviceTypeHandler extends GrpcHandler {
    constructor(protoFile=defaultProtoFile, serviceName=defaultServiceName, targetHost=defaultTargetHost, targetPort=defaultTargetPort) {
        super(protoFile, serviceName, targetHost, targetPort);    
    }

    getAllIotDeviceTypes(arg, success, failure) {
        this.clientStuff.getAllIotDeviceTypes(arg, this.handleResponse(success, failure));
    }
    
    createIotDeviceType(arg, success, failure) {
        this.clientStuff.createIotDeviceType(arg, this.handleResponse(success, failure));
    }

    getIotDeviceTypeById(arg, success, failure) {
        this.clientStuff.getIotDeviceTypeById(arg, this.handleResponse(success, failure));
    }

    updateIotDeviceTypeById(arg, success, failure) {
        this.clientStuff.updateIotDeviceTypeById(arg, this.handleResponse(success, failure));
    }

    deleteIotDeviceTypeById(arg, success, failure) {
        this.clientStuff.deleteIotDeviceTypeById(arg, this.handleResponse(success, failure));
    }
}

function newIotDeviceTypeHandler() {
    return new IotDeviceTypeHandler();
}

module.exports.newIotDeviceTypeHandler = newIotDeviceTypeHandler;
