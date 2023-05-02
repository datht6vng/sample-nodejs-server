



const { GrpcHandler } = require("./grpc_handler");

const { config } = require("../../../../pkg/config/config");

const rtspSenderServerConfig = config.rtsp_sender_server;
const defaultProtoFile = "rtsp_sender.proto";
const defaultServiceName = "RTSPSender";
const defaultTargetHost = rtspSenderServerConfig.grpc.host;
const defaultTargetPort = rtspSenderServerConfig.grpc.port;

class VideoRecordingHandler extends GrpcHandler {
    constructor(protoFile=defaultProtoFile, serviceName=defaultServiceName, targetHost=defaultTargetHost, targetPort=defaultTargetPort) {
        // super(protoFile, serviceName, targetHost, targetPort);
    }    

    // async connect(camera) {
    //     const arg = {
    //         clientID: camera.getId().getValue(),
    //         connectClientAddress: camera.getRtspStreamUrl(),
    //         username: camera.getUsername(),
    //         password: camera.getPassword(),
    //         enableRTSPRelay: true
    //     }
    //     const response = await this.callRpc(this.clientStuff.connect, arg);
    //     return response.data.replayAddress;
    // }


    // async disconnect(camera) {
    //     const arg = {
    //         clientID: camera.getId().getValue(),
    //         connectClientAddress: camera.getRtspStreamUrl()
    //     }
    //     const response = await this.callRpc(this.clientStuff.disconnect, arg);
    //     return response;
    // }

    
}

function newVideoRecordingHandler(protoFile=defaultProtoFile, serviceName=defaultServiceName, targetHost=defaultTargetHost, targetPort=defaultTargetPort) {
    return new VideoRecordingHandler(protoFile, serviceName, targetHost, targetPort);
}

module.exports.newVideoRecordingHandler = newVideoRecordingHandler;
