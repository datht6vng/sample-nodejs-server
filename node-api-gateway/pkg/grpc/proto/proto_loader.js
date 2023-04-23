const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const defaultLoaderOptions = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
    includeDirs: [__dirname]
};

class ProtoLoader {
    constructor() {

    } 

}

ProtoLoader.prototype.loadPackage = function(fileName, options=defaultLoaderOptions) {
    const path = __dirname + "/" + fileName;
    const packageDef = protoLoader.loadSync(path, options);
    const protoDescriptor = grpc.loadPackageDefinition(packageDef);
    return protoDescriptor;
}

ProtoLoader.prototype.getClientStub = function(fileName, serviceName, ipAddress, port) {
    const protoDescriptor = this.loadPackage(fileName);
    const Service = protoDescriptor[serviceName];
    return new Service(
        `${ipAddress}:${port}`,
        grpc.credentials.createInsecure()
    );

}

function newProtoLoader() {
    return new ProtoLoader();
}

module.exports.newProtoLoader = newProtoLoader;

