const app = require("../../internal/server/interface/http/app");
const config = require("../../pkg/configs/configs");

const httpApp = app.NewHTTPApp();






const grpc = require("@grpc/grpc-js");
const { ProtoLoader } = require("../../internal/server/interface/grpc/proto/ProtoLoader");
const protoLoader = new ProtoLoader();

let packageDef = protoLoader.loadPackage("example.proto");

const ExampleService = packageDef.ExampleService;
let clientStub = new ExampleService(    
    "node-api-server:50051",
    grpc.credentials.createInsecure()
);
clientStub.retrievePasswords({}, (error, passwords) => {
  //implement your error logic here
  console.log(passwords);
});










const { createProxyMiddleware } = require('http-proxy-middleware');
createProxyMiddleware('/', { target: 'node-api-server', ws: true });





// const grpc = require("@grpc/grpc-js");
// var protoLoader = require("@grpc/proto-loader");
// const { ExampleHandler } = require("../../../node-api-server/internal/server/interface/grpc/handler/example");
// const PROTO_PATH = __dirname + "/password.proto";

// const options = {
//     keepCase: true,
//     longs: String,
//     enums: String,
//     defaults: true,
//     oneofs: true,
// };
// var grpcObj = protoLoader.loadSync(PROTO_PATH, options);
// const PasswordService = grpc.loadPackageDefinition(grpcObj).PasswordService;

// const clientStub = new PasswordService(
//     "192.168.0.105:50051",
//     grpc.credentials.createInsecure()
// );

// clientStub.retrievePasswords({}, (error, passwords) => {
//     //implement your error logic here
//     console.log(passwords);
// });






// const request = require('request');

// request('http://192.168.0.104:3000/api/test', (err, res, body) => {
//   console.log(99999999999)
// });



const server = httpApp.listen(config.config.server.port, () =>
  console.log(
    `Server is running at http://localhost:${config.config.server.port}`
  )
);
