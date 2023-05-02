const { GrpcHandler } = require("./grpc_handler");

const { config } = require("../../../../../pkg/config/config");

const apiServerConfig = config.api_server;
const defaultProtoFile = "report.proto";
const defaultServiceName = "ReportService";
const defaultTargetHost = apiServerConfig.grpc.host;
const defaultTargetPort = apiServerConfig.grpc.port;

class ReportHandler extends GrpcHandler {
    constructor(protoFile=defaultProtoFile, serviceName=defaultServiceName, targetHost=defaultTargetHost, targetPort=defaultTargetPort) {
        super(protoFile, serviceName, targetHost, targetPort);    
    }

    findAllEventStatisticCount(arg, success, failure) {
        this.clientStuff.findAllEventStatisticCount(arg, this.handleResponse(success, failure));
    }

    findNumberOfIotEventByType(arg, success, failure) {
        this.clientStuff.findNumberOfIotEventByType(arg, this.handleResponse(success, failure));
    }
    
    findNumberOfIotEventByTypeAndTrueAlarm(arg, success, failure) {
        this.clientStuff.findNumberOfIotEventByTypeAndTrueAlarm(arg, this.handleResponse(success, failure));
    }

    findNumberOfIotEventByInterval(arg, success, failure) {
        this.clientStuff.findNumberOfIotEventByInterval(arg, this.handleResponse(success, failure));
    }

}

function newReportHandler() {
    return new ReportHandler();
}

module.exports.newReportHandler = newReportHandler;
