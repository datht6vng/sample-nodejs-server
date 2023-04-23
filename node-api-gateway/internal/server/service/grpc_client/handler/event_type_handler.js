const { GrpcHandler } = require("./grpc_handler");

const { config } = require("../../../../../pkg/config/config");

const apiServerConfig = config.api_server;
const defaultProtoFile = "event_type.proto";
const defaultServiceName = "EventTypeService";
const defaultTargetHost = apiServerConfig.grpc.host;
const defaultTargetPort = apiServerConfig.grpc.port;

class EventTypeHandler extends GrpcHandler {
    constructor(protoFile=defaultProtoFile, serviceName=defaultServiceName, targetHost=defaultTargetHost, targetPort=defaultTargetPort) {
        super(protoFile, serviceName, targetHost, targetPort);    
    }

    getAllEventTypes(arg, success, failure) {
        this.clientStuff.getAllEventTypes(arg, this.handleResponse(success, failure));
    }
    
    createEventType(arg, success, failure) {
        this.clientStuff.createEventType(arg, this.handleResponse(success, failure));
    }

    getEventTypeById(arg, success, failure) {
        this.clientStuff.getEventTypeById(arg, this.handleResponse(success, failure));
    }

    updateEventTypeById(arg, success, failure) {
        this.clientStuff.updateEventTypeById(arg, this.handleResponse(success, failure));
    }

    deleteEventTypeById(arg, success, failure) {
        this.clientStuff.deleteEventTypeById(arg, this.handleResponse(success, failure));
    }
}

function newEventTypeHandler() {
    return new EventTypeHandler();
}

module.exports.newEventTypeHandler = newEventTypeHandler;
