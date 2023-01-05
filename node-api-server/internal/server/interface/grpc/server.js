const grpc = require("@grpc/grpc-js");
const { ProtoLoader } = require("./proto/ProtoLoader");

const { ExampleHandler } = require("./handler/example");

class GRPCServer {
    constructor() {
        this.server = new grpc.Server();
        this.protoLoader = new ProtoLoader();
    }
    start() {

        this.server.addService(this.protoLoader.loadPackage("example.proto").ExampleService.service, new ExampleHandler());

        this.server.bindAsync(
            "0.0.0.0:50051",
            grpc.ServerCredentials.createInsecure(),
            (error, port) => {
                this.server.start();
                console.log("Server is running at port 50051");
            }
        );
    }

}

module.exports.GRPCServer = GRPCServer;

