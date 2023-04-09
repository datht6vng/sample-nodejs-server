const { GrpcHandler } = require("./grpc_handler");

const { config } = require("../../../../../pkg/config/config");

const apiServerConfig = config.api_server;
const defaultProtoFile = "event.proto";
const defaultServiceName = "EventService";
const defaultTargetHost = apiServerConfig.grpc.host;
const defaultTargetPort = apiServerConfig.grpc.port;

class EventHandler extends GrpcHandler {
    constructor(protoFile=defaultProtoFile, serviceName=defaultServiceName, targetHost=defaultTargetHost, targetPort=defaultTargetPort) {
        super(protoFile, serviceName, targetHost, targetPort);    
    }

    getAllEvents(arg, success, failure) {
        this.clientStuff.getAllEvents(arg, this.handleResponse(success, failure));
    }
    
    createEvent(arg, success, failure) {
        this.clientStuff.createEvent(arg, this.handleResponse(success, failure));
    }

    getEventById(arg, success, failure) {
        this.clientStuff.getEventById(arg, this.handleResponse(success, failure));
    }

    updateEventById(arg, success, failure) {
        this.clientStuff.updateEventById(arg, this.handleResponse(success, failure));
    }

    deleteEventById(arg, success, failure) {
        this.clientStuff.deleteEventById(arg, this.handleResponse(success, failure));
    }
}

function newEventHandler() {
    return new EventHandler();
}

module.exports.newEventHandler = newEventHandler;
