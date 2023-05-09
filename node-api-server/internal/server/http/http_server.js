const { config } = require("../../../pkg/config/config");
const { logger } = require("../../../pkg/logger/logger");
const httpServerConfig = config.server.http;
const express = require("express");
const app = express();
const server = app.listen(httpServerConfig.port, () => {
    logger.info(`Http server is running at ${httpServerConfig.scheme}://${httpServerConfig.host}:${httpServerConfig.port}`)
});
module.exports.httpServer = server;
