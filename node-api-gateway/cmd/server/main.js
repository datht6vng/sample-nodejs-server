
const { newHttpApp } = require("../../internal/server/interface/http/app");

function main() {
  let httpApp = newHttpApp();
  httpApp.start();
}

main();






















// /**
//  * Module dependencies.
//  */
//  const express = require('express');
//  const { createProxyMiddleware } = require('http-proxy-middleware');
 
//  /**
//   * Configure proxy middleware
//   */
//  const wsProxy = createProxyMiddleware({
//    target: 'http://node-api-server:3000' ,
//    // pathRewrite: {
//    //  '^/websocket' : '/socket',        // rewrite path.
//    //  '^/removepath' : ''               // remove path.
//    // },
//    changeOrigin: true, // for vhosted sites, changes host header to match to target's host
//    ws: true, // enable websocket proxy
//    logger: console,
//  });
 

//  console.log(wsProxy)

//  const app = express();
//  app.use(wsProxy); // add the proxy to express
 
//  const server = app.listen(3001);
//  server.on('upgrade', wsProxy.upgrade); // optional: upgrade externally