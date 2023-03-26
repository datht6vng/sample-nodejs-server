const { GrpcService } = require("./grpc_service");
const { newProtoLoader } = require("../../../../pkg/grpc/proto/proto_loader");


class CameraMapService extends GrpcService {
    constructor(protoLoader=newProtoLoader(), protoFile='camera_map.proto', serviceName='CameraMapService', targetHost='node-api-server', targetPort='50051') {
        super();
        this.protoLoader = protoLoader;
        this.protoFile = protoFile;
        this.serviceName = serviceName;
        this.targetHost = targetHost;
        this.targetPort = targetPort;
        this.clientStuff = this.protoLoader.getClientStub(this.protoFile, this.serviceName, this.targetHost, this.targetPort);
    }

}

CameraMapService.prototype.getAllCamerasMap = function(arg, success, failure) {
    const self = this;
    this.clientStuff.getAllCamerasMap(arg, self.handleResponse(success, failure));
}

function newCameraMapService() {
    return new CameraMapService();
}

module.exports.newCameraMapService = newCameraMapService;
