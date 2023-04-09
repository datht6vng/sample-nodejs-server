const { GrpcHandler } = require("./grpc_handler");

const { config } = require("../../../../../pkg/config/config");

const apiServerConfig = config.api_server;
const defaultProtoFile = "camera_type.proto";
const defaultServiceName = "CameraTypeService";
const defaultTargetHost = apiServerConfig.grpc.host;
const defaultTargetPort = apiServerConfig.grpc.port;

class CameraTypeHandler extends GrpcHandler {
    constructor(protoFile=defaultProtoFile, serviceName=defaultServiceName, targetHost=defaultTargetHost, targetPort=defaultTargetPort) {
        super(protoFile, serviceName, targetHost, targetPort);    
    }

    getAllCameraTypes(arg, success, failure) {
        this.clientStuff.getAllCameraTypes(arg, this.handleResponse(success, failure));
    }
    
    createCameraType(arg, success, failure) {
        this.clientStuff.createCameraType(arg, this.handleResponse(success, failure));
    }

    getCameraTypeById(arg, success, failure) {
        this.clientStuff.getCameraTypeById(arg, this.handleResponse(success, failure));
    }

    updateCameraTypeById(arg, success, failure) {
        this.clientStuff.updateCameraTypeById(arg, this.handleResponse(success, failure));
    }

    deleteCameraTypeById(arg, success, failure) {
        this.clientStuff.deleteCameraTypeById(arg, this.handleResponse(success, failure));
    }
}

function newCameraTypeHandler() {
    return new CameraTypeHandler();
}

module.exports.newCameraTypeHandler = newCameraTypeHandler;
