const { GrpcHandler } = require("./grpc_handler");

const { config } = require("../../../../../pkg/config/config");

const apiServerConfig = config.api_server;
const defaultProtoFile = "camera.proto";
const defaultServiceName = "CameraService";
const defaultTargetHost = apiServerConfig.grpc.host;
const defaultTargetPort = apiServerConfig.grpc.port;

class CameraHandler extends GrpcHandler {
    constructor(protoFile=defaultProtoFile, serviceName=defaultServiceName, targetHost=defaultTargetHost, targetPort=defaultTargetPort) {
        super(protoFile, serviceName, targetHost, targetPort);    
    }

    getAllCameras(arg, success, failure) {
        this.clientStuff.getAllCameras(arg, this.handleResponse(success, failure));
    }
    
    createCamera(arg, success, failure) {
        this.clientStuff.createCamera(arg, this.handleResponse(success, failure));
    }

    getCameraById(arg, success, failure) {
        this.clientStuff.getCameraById(arg, this.handleResponse(success, failure));
    }

    updateCameraById(arg, success, failure) {
        this.clientStuff.updateCameraById(arg, this.handleResponse(success, failure));
    }

    deleteCameraById(arg, success, failure) {
        this.clientStuff.deleteCameraById(arg, this.handleResponse(success, failure));
    }
}

function newCameraHandler() {
    return new CameraHandler();
}

module.exports.newCameraHandler = newCameraHandler;
