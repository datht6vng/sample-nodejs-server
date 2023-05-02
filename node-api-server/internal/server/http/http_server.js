const { config } = require("../../../pkg/config/config");
const httpServerConfig = config.server.http;
const express = require("express");
const app = express();
const server = app.listen(httpServerConfig.port, () => {
    console.log(`Http server is running at ${httpServerConfig.scheme}://${httpServerConfig.host}:${httpServerConfig.port}`)
});
module.exports.httpServer = server;
