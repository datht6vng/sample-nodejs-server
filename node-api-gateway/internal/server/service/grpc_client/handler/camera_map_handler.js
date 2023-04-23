const { GrpcHandler } = require("./grpc_handler");

const { config } = require("../../../../../pkg/config/config");

const apiServerConfig = config.api_server;
const defaultProtoFile = "camera_map.proto";
const defaultServiceName = "CameraMapService";
const defaultTargetHost = apiServerConfig.grpc.host;
const defaultTargetPort = apiServerConfig.grpc.port;

class CameraMapHandler extends GrpcHandler {
    constructor(protoFile=defaultProtoFile, serviceName=defaultServiceName, targetHost=defaultTargetHost, targetPort=defaultTargetPort) {
        super(protoFile, serviceName, targetHost, targetPort);    
    }

    getAllCameraMaps(arg, success, failure) {
        this.clientStuff.getAllCameraMaps(arg, this.handleResponse(success, failure));
    }
    
    createCameraMap(arg, success, failure) {
        this.clientStuff.createCameraMap(arg, this.handleResponse(success, failure));
    }

    getCameraMapById(arg, success, failure) {
        this.clientStuff.getCameraMapById(arg, this.handleResponse(success, failure));
    }

    updateCameraMapById(arg, success, failure) {
        this.clientStuff.updateCameraMapById(arg, this.handleResponse(success, failure));
    }

    deleteCameraMapById(arg, success, failure) {
        this.clientStuff.deleteCameraMapById(arg, this.handleResponse(success, failure));
    }
}

function newCameraMapHandler() {
    return new CameraMapHandler();
}

module.exports.newCameraMapHandler = newCameraMapHandler;
