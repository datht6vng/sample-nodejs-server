const grpc = require("@grpc/grpc-js");
const { newProtoLoader } = require("../../../../pkg/grpc/proto/proto_loader");

const { config } = require("../../../../pkg/config/config");

const { newAreaHandler } = require("./handler/area_handler");

class GrpcServer {
    constructor() {
        this.server = new grpc.Server();
        this.protoLoader = newProtoLoader();
        this.conf = config.server.grpc;
        this.initService();
    }

}

GrpcServer.prototype.initService = function() {
    this.server.addService(this.protoLoader.getService('area.proto', 'AreaService'), newAreaHandler());
}

GrpcServer.prototype.start = function(host=this.conf.host, port=this.conf.port) {
    this.server.bindAsync(
        `${this.conf.binding_ip_address}:${port}`,
        grpc.ServerCredentials.createInsecure(),
        (error, port) => {
            this.server.start();
            console.log(`Grpc server is running at ${host}:${port}`);
        }
    );
}

function newGrpcServer() {
    return new GrpcServer();
}

module.exports.newGrpcServer = newGrpcServer;

