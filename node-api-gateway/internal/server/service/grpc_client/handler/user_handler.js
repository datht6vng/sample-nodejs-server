const { GrpcHandler } = require("./grpc_handler");

const { config } = require("../../../../../pkg/config/config");

const apiServerConfig = config.api_server;
const defaultProtoFile = "user.proto";
const defaultServiceName = "UserService";
const defaultTargetHost = apiServerConfig.grpc.host;
const defaultTargetPort = apiServerConfig.grpc.port;

class UserHandler extends GrpcHandler {
    constructor(protoFile=defaultProtoFile, serviceName=defaultServiceName, targetHost=defaultTargetHost, targetPort=defaultTargetPort) {
        super(protoFile, serviceName, targetHost, targetPort);    
    }

    getAllUsers(arg, success, failure) {
        this.clientStuff.getAllUsers(arg, this.handleResponse(success, failure));
    }
    
    createUser(arg, success, failure) {
        this.clientStuff.createUser(arg, this.handleResponse(success, failure));
    }

    getUserById(arg, success, failure) {
        this.clientStuff.getUserById(arg, this.handleResponse(success, failure));
    }

    updateUserById(arg, success, failure) {
        this.clientStuff.updateUserById(arg, this.handleResponse(success, failure));
    }

    deleteUserById(arg, success, failure) {
        this.clientStuff.deleteUserById(arg, this.handleResponse(success, failure));
    }
}

function newUserHandler() {
    return new UserHandler();
}

module.exports.newUserHandler = newUserHandler;
