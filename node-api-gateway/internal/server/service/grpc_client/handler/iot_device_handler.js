const { GrpcHandler } = require("./grpc_handler");

const { config } = require("../../../../../pkg/config/config");

const apiServerConfig = config.api_server;
const defaultProtoFile = "iot_device.proto";
const defaultServiceName = "IotDeviceService";
const defaultTargetHost = apiServerConfig.grpc.host;
const defaultTargetPort = apiServerConfig.grpc.port;

class IotDeviceHandler extends GrpcHandler {
    constructor(protoFile=defaultProtoFile, serviceName=defaultServiceName, targetHost=defaultTargetHost, targetPort=defaultTargetPort) {
        super(protoFile, serviceName, targetHost, targetPort);    
    }

    getAllIotDevices(arg, success, failure) {
        this.clientStuff.getAllIotDevices(arg, this.handleResponse(success, failure));
    }
    
    createIotDevice(arg, success, failure) {
        this.clientStuff.createIotDevice(arg, this.handleResponse(success, failure));
    }

    getIotDeviceById(arg, success, failure) {
        this.clientStuff.getIotDeviceById(arg, this.handleResponse(success, failure));
    }

    updateIotDeviceById(arg, success, failure) {
        this.clientStuff.updateIotDeviceById(arg, this.handleResponse(success, failure));
    }

    deleteIotDeviceById(arg, success, failure) {
        this.clientStuff.deleteIotDeviceById(arg, this.handleResponse(success, failure));
    }
}

function newIotDeviceHandler() {
    return new IotDeviceHandler();
}

module.exports.newIotDeviceHandler = newIotDeviceHandler;
