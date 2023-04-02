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
    // loadPackage(filename, options=defaultLoaderOptions) {
    //     const path = __dirname + "/" + filename;
    //     const packageDef = protoLoader.loadSync(path, options);
    //     const packetObject = grpc.loadPackageDefinition(packageDef);
    //     return packetObject;
    // }
}

ProtoLoader.prototype.loadPackage = function(fileName, options=defaultLoaderOptions) {
    const path = __dirname + "/" + fileName;
    const packageDef = protoLoader.loadSync(path, options);
    const protoDescriptor = grpc.loadPackageDefinition(packageDef);
    return protoDescriptor;
}

ProtoLoader.prototype.getService = function(fileName, serviceName) {
    const protoDescriptor = this.loadPackage(fileName);
    return protoDescriptor[serviceName].service;
}

function newProtoLoader() {
    return new ProtoLoader();
}

module.exports.ProtoLoader = ProtoLoader;
module.exports.newProtoLoader = newProtoLoader;

