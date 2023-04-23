const { GrpcService } = require("./grpc_service");
const { newProtoLoader } = require("../../../../pkg/grpc/proto/proto_loader");


class AreaService extends GrpcService {
    constructor(protoLoader=newProtoLoader(), protoFile='area.proto', serviceName='AreaService', targetHost='node-api-server', targetPort='50051') {
        super();
        this.protoLoader = protoLoader;
        this.protoFile = protoFile;
        this.serviceName = serviceName;
        this.targetHost = targetHost;
        this.targetPort = targetPort;
        this.clientStuff = this.protoLoader.getClientStub(this.protoFile, this.serviceName, this.targetHost, this.targetPort);
    }

}

AreaService.prototype.getAllAreas = function(arg, success, failure) {
    const self = this;
    this.clientStuff.getAllAreas(arg, self.handleResponse(success, failure));
}

AreaService.prototype.createArea = function(arg, success, failure) {
    const self = this;
    this.clientStuff.createArea(arg, self.handleResponse(success, failure));
}

AreaService.prototype.getAllAreasByType = function(arg, success, failure) {
    const self = this;
    this.clientStuff.getAllAreasByType(arg, self.handleResponse(success, failure));
}

function newAreaService() {
    return new AreaService();
}

module.exports.newAreaService = newAreaService;
