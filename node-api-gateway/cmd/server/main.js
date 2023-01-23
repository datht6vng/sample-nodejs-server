// const app = require("../../internal/server/interface/http/app");
// const config = require("../../pkg/configs/configs");

// const httpApp = app.NewHTTPApp();




// const grpc = require("@grpc/grpc-js");
// const { ProtoLoader } = require("../../internal/server/interface/grpc/proto/ProtoLoader");
// const protoLoader = new ProtoLoader();

// let packageDef = protoLoader.loadPackage("example.proto");

// const ExampleService = packageDef.ExampleService;
// let clientStub = new ExampleService(    
//     "node-api-server:50051",
//     grpc.credentials.createInsecure()
// );
// clientStub.retrievePasswords({}, (error, passwords) => {
//   //implement your error logic here
//   console.log(passwords);
// });




// const server = httpApp.listen(config.config.server.port, () =>
//   console.log(
//     `Server is running at http://localhost:${config.config.server.port}`
//   )
// );










// /**
//  * Module dependencies.
//  */
//  const express = require('express');
//  const { createProxyMiddleware } = require('http-proxy-middleware');
 
//  /**
//   * Configure proxy middleware
//   */
//  const jsonPlaceholderProxy = createProxyMiddleware({
//    target: 'http://' + 'node-api-server:' + '3000/',
//    changeOrigin: true, // for vhosted sites, changes host header to match to target's host
//    logger: console,
//  });
 
//  const app = express();
 
//  /**
//   * Add the proxy to express
//   */
//  app.use('/users', jsonPlaceholderProxy);
 
//  app.listen(3001, () =>
//  console.log(
//    `Server is running on http://127.0.0.1:3001`
//  )
// );










/**
 * Module dependencies.
 */
 const express = require('express');
 const { createProxyMiddleware } = require('http-proxy-middleware');
 
 /**
  * Configure proxy middleware
  */
 const wsProxy = createProxyMiddleware({
   target: 'http://node-api-server:3000' ,
   // pathRewrite: {
   //  '^/websocket' : '/socket',        // rewrite path.
   //  '^/removepath' : ''               // remove path.
   // },
   changeOrigin: true, // for vhosted sites, changes host header to match to target's host
   ws: true, // enable websocket proxy
   logger: console,
 });
 

 console.log(wsProxy)

 const app = express();
 app.use(wsProxy); // add the proxy to express
 
 const server = app.listen(3001);
 server.on('upgrade', wsProxy.upgrade); // optional: upgrade externally