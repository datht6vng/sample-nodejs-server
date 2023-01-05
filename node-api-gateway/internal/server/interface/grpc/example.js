var PROTO_PATH = __dirname + '/../../../../protos/example/example.proto';
var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');
// Suggested options for similarity to existing grpc.load behavior
var packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });
var protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
// The protoDescriptor object has the full package hierarchy
const Example = protoDescriptor.Example;
const client = new Example(
    '192.168.0.104:3000',
    grpc.credentials.createInsecure()
)

client.get({}, (error, message) => {
    console.log(message)
    if (error) throw error;
    
    console.log(message);
})
