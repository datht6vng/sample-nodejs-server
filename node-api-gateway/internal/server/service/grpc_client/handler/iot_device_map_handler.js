const { GrpcHandler } = require("./grpc_handler");

const { config } = require("../../../../../pkg/config/config");

const apiServerConfig = config.api_server;
const defaultProtoFile = "iot_device_map.proto";
const defaultServiceName = "IotDeviceMapService";
const defaultTargetHost = apiServerConfig.grpc.host;
const defaultTargetPort = apiServerConfig.grpc.port;

class IotDeviceMapHandler extends GrpcHandler {
    constructor(protoFile=defaultProtoFile, serviceName=defaultServiceName, targetHost=defaultTargetHost, targetPort=defaultTargetPort) {
        super(protoFile, serviceName, targetHost, targetPort);    
    }

    getAllIotDeviceMaps(arg, success, failure) {
        this.clientStuff.getAllIotDeviceMaps(arg, this.handleResponse(success, failure));
    }
    
    createIotDeviceMap(arg, success, failure) {
        this.clientStuff.createIotDeviceMap(arg, this.handleResponse(success, failure));
    }

    getIotDeviceMapById(arg, success, failure) {
        this.clientStuff.getIotDeviceMapById(arg, this.handleResponse(success, failure));
    }

    updateIotDeviceMapById(arg, success, failure) {
        this.clientStuff.updateIotDeviceMapById(arg, this.handleResponse(success, failure));
    }

    deleteIotDeviceMapById(arg, success, failure) {
        this.clientStuff.deleteIotDeviceMapById(arg, this.handleResponse(success, failure));
    }
}

function newIotDeviceMapHandler() {
    return new IotDeviceMapHandler();
}

module.exports.newIotDeviceMapHandler = newIotDeviceMapHandler;
