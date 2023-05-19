



const { GrpcHandler } = require("./grpc_handler");

const { config } = require("../../../../pkg/config/config");

const controllerServerConfig = config.controller_server;
const defaultProtoFile = "controller.proto";
const defaultServiceName = "Controller";
const defaultTargetHost = controllerServerConfig.grpc.host;
const defaultTargetPort = controllerServerConfig.grpc.port;

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
