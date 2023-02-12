const grpc = require("@grpc/grpc-js");
const { ProtoLoader } = require("../../../../pkg/grpc/proto/proto_loader");

const { config } = require("../../../../pkg/config/config");

const { ExampleHandler } = require("./handler/example_handler");
const { newAreaHandler } = require("./handler/area_handler");
// const { IotDeviceHandler } = require("./handler/iot_device_handler");
// const { EventHandler } = require("./handler/event_handler");

class GRPCServer {
    constructor(binding_ip_address=config.server.grpc.binding_ip_address, port=config.server.grpc.port) {
        this.server = new grpc.Server();
        this.protoLoader = new ProtoLoader();
        this.binding_ip_address = binding_ip_address;
        this.port = port;
        
    }

}

GRPCServer.prototype.start = function() {
    this.server.addService(this.protoLoader.loadPackage("example.proto").ExampleService.service, new ExampleHandler());
    this.server.addService(this.protoLoader.loadPackage("area.proto").AreaService.service, newAreaHandler());
    // this.server.addService(this.protoLoader.loadPackage("iot_device.proto").IotDeviceService.service, new IotDeviceHandler());
    // this.server.addService(this.protoLoader.loadPackage("event.proto").EventService.service, new EventHandler());

    this.server.bindAsync(
        `${this.binding_ip_address}:${this.port}`,
        grpc.ServerCredentials.createInsecure(),
        (error, port) => {
            this.server.start();
            console.log(`Server is listening on port ${this.port}`);
        }
    );
}

module.exports.GRPCServer = GRPCServer;

