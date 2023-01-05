const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const defaultLoaderOptions = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
};

class ProtoLoader {
    constructor() {

    } 
    loadPackage(filename, options=defaultLoaderOptions) {
        const path = __dirname + "/" + filename;
        const packageDef = protoLoader.loadSync(path, options);
        const packetObject = grpc.loadPackageDefinition(packageDef);
        return packetObject;
    }
}

module.exports.ProtoLoader = ProtoLoader;

