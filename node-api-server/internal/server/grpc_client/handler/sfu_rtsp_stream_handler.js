const { GrpcHandler } = require("./grpc_handler");

const { config } = require("../../../../pkg/config/config");

const rtspSenderServerConfig = config.rtsp_sender_server;
const defaultProtoFile = "rtsp_sender.proto";
const defaultServiceName = "RTSPSender";
const defaultTargetHost = rtspSenderServerConfig.grpc.host;
const defaultTargetPort = rtspSenderServerConfig.grpc.port;

const rtspSenderHttp = rtspSenderServerConfig.http;

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

        console.log("Send to controller message: ", arg);

        let response;
        try {
            response = await this.callRpc(this.clientStuff.connect, arg);
        }
        catch(err) {
            const message = `Failed to connect to rtsp sender with cliendID = ${arg.clientID}. Detail: ${err.toString()}`;
            this.handleError(err, message);
        }

        console.log("Response from controller when call connect: ", response);

        return response.data.relayAddress;
    }


    async disconnect(camera) {
        const arg = {
            clientID: camera.getId().getValue(),
            connectClientAddress: camera.getRtspStreamUrl()
        }
        let response;
        try {
            response = await this.callRpc(this.clientStuff.disconnect, arg);
        }
        catch(err) {
            const message = `Failed to connect to rtsp sender with cliendID = ${arg.clientID}. Detail: ${err.toString()}`;
            this.handleError(err, message);
        }
        return response;
    }

    async getRecordFile(cameraId, eventTime) {
        cameraId = cameraId.getValue();
        eventTime = new Date(eventTime).getTime() * 1000000;
        const arg = {
            clientID: cameraId,
            timestamp: eventTime
        }
        let response;
        try {
            response = await this.callRpc(this.clientStuff.getRecordFile, arg);
        }
        catch(err) {
            const message = `Failed to get record from rtsp sender with camera = ${arg.clientID}. Detail: ${err.toString()}`;
            this.handleError(err, message);
        }
        
        console.log("Receive from controller record file: ", response.fileAddress);

        const result = {
            startTime: new Date(response.startTime / 1000000).toISOString(),
            endTime: new Date(response.endTime / 1000000).toISOString(),
            normalVideoUrl: `${rtspSenderHttp.scheme}://${rtspSenderHttp.host}:${rtspSenderHttp.port}${response.fileAddress}`
        }

        
        return result;
    }
}

function newSfuRtspStreamHandler(protoFile=defaultProtoFile, serviceName=defaultServiceName, targetHost=defaultTargetHost, targetPort=defaultTargetPort) {
    return new SfuRtspStreamHandler(protoFile, serviceName, targetHost, targetPort);
}

module.exports.newSfuRtspStreamHandler = newSfuRtspStreamHandler;
