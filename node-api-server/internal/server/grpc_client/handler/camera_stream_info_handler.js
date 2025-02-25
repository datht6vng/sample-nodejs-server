const { GrpcHandler } = require("./grpc_handler");

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
        cameraStreamInfo.event_key = cameraStreamInfo.event_type.event_key;
        const arg = {
            camera_stream_detail: cameraStreamInfo
        }

        console.log("Create new stream in AI server: ", arg);

        let response;
        try {
            response = await this.callRpc(this.clientStuff.createCameraStream, arg);
        }
        catch(err) {
            const message = `Failed to create new stream in AI server with camera ${cameraStreamInfo._id}. Detail: ${err.toString()}`;
            this.handleError(err, message);
        }
        return response;
    }

    async updateCameraStreamInfoById(id, cameraStreamInfo) {
        cameraStreamInfo = this.toProtobufConverter.visit(cameraStreamInfo);
        id = id.getValue();
        const arg = {
            _id: id,
            camera_stream_detail: cameraStreamInfo
        }
        let response;
        try {
            response = await this.callRpc(this.clientStuff.updateCameraStreamInfoById, arg);
        }
        catch(err) {
            const message = `Failed to update stream in AI server with camera ${arg._id}. Detail: ${err.toString()}`;
            this.handleError(err, message);
        }
        return response;
    }


    async deleteCameraStreamById(id) {
        id = id.getValue();
        const arg = {
            _id: id
        }
        let response;
        try {
            response = await this.callRpc(this.clientStuff.deleteCameraStreamById, arg);
        }
        catch(err) {
            const message = `Failed to delete stream in AI server with camera ${arg._id}. Detail: ${err.toString()}`;
            this.handleError(err, message);
        }
        return response;
    }
}

function newCameraStreamInfoHandler(protoFile=defaultProtoFile, serviceName=defaultServiceName, targetHost=defaultTargetHost, targetPort=defaultTargetPort) {
    return new CameraStreamInfoHandler(protoFile, serviceName, targetHost, targetPort);
}

module.exports.newCameraStreamInfoHandler = newCameraStreamInfoHandler;
