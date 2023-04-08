const GrpcHandler = require("./grpc_handler");

const { config } = require("../../../../pkg/config/config");

const aiServerConfig = config.ai_server;
const defaultProtoFile = "camera_stream_info.proto";
const defaultServiceName = "CameraStreamInfoService";
const defaultTargetHost = aiServerConfig.grpc.host;
const defaultTargetPort = aiServerConfig.grpc.port;

class CameraStreamInfoHandler extends GrpcHandler {
    constructor(protoFile=defaultProtoFile, serviceName=defaultServiceName, targetHost=defaultTargetHost, targetPort=defaultTargetPort) {
        super(protoFile, serviceName, targetHost, targetPort);
    }    

    async createCameraStream(cameraStreamInfo) {
        cameraStreamInfo = this.toProtobufConverter.visit(cameraStreamInfo);
        const arg = {
            camera_stream_detail: cameraStreamInfo
        }
        const response = await this.callRpc(this.clientStuff.createCameraStream, arg);
        return response;
    }
}

function newCameraStreamInfoHandler(protoFile=defaultProtoFile, serviceName=defaultServiceName, targetHost=defaultTargetHost, targetPort=defaultTargetPort) {
    return new CameraStreamInfoHandler;
}

module.exports.newCameraStreamInfoHandler = newCameraStreamInfoHandler;
