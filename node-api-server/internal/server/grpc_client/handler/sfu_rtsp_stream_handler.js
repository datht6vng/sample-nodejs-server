const { GrpcHandler } = require("./grpc_handler");

const { config } = require("../../../../pkg/config/config");

const rtspSenderServerConfig = config.rtsp_sender_server;
const defaultProtoFile = "rtsp_sender.proto";
const defaultServiceName = "RTSPSender";
const defaultTargetHost = rtspSenderServerConfig.grpc.host;
const defaultTargetPort = rtspSenderServerConfig.grpc.port;

class SfuRtspStreamHandler extends GrpcHandler {
    constructor(protoFile=defaultProtoFile, serviceName=defaultServiceName, targetHost=defaultTargetHost, targetPort=defaultTargetPort) {
        super(protoFile, serviceName, targetHost, targetPort);
    }    

    async connect(camera) {
        const arg = {
            clientID: camera.getId().getValue(),
            connectClientAddress: camera.getRtspStreamUrl(),
            username: camera.getUsername(),
            password: camera.getPassword(),
            enableRTSPRelay: true,
            enableRecord: true
        }
        const response = await this.callRpc(this.clientStuff.connect, arg);
        return response.data.relayAddress;
    }


    async disconnect(camera) {
        const arg = {
            clientID: camera.getId().getValue(),
            connectClientAddress: camera.getRtspStreamUrl()
        }
        const response = await this.callRpc(this.clientStuff.disconnect, arg);
        return response;
    }

    async getRecordFile(cameraId, eventTime) {
        cameraId = cameraId.getvalue();
        eventTime = new Date(eventTime).getTime() / 1000;
        const arg = {
            clientId: cameraId,
            timestamp: eventTime
        }
        const response = await this.callRpc(this.clientStuff.getRecordFile, arg);
        const responseData = response.data;
        const result = {
            startTime: new Date(responseData.startTime * 1000).toISOString(),
            endTime: new Date(responseData.endTime * 1000).toISOString(),
            // normalVideoUrl: ,
        }
        return result;
    }
}

function newSfuRtspStreamHandler(protoFile=defaultProtoFile, serviceName=defaultServiceName, targetHost=defaultTargetHost, targetPort=defaultTargetPort) {
    return new SfuRtspStreamHandler(protoFile, serviceName, targetHost, targetPort);
}

module.exports.newSfuRtspStreamHandler = newSfuRtspStreamHandler;
