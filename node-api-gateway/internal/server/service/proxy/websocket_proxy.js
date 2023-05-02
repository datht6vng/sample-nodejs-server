const { createProxyMiddleware } = require('http-proxy-middleware');

const { config } = require("../../../../pkg/config/config");

const targetServer = config.api_server.http;

const wsProxy = createProxyMiddleware({
    target: `${targetServer.scheme}://${targetServer.host}:${targetServer.port}`,
    // pathRewrite: {
    //  '^/websocket' : '/socket',        // rewrite path.
    //  '^/removepath' : ''               // remove path.
    // },
    changeOrigin: true, // for vhosted sites, changes host header to match to target's host
    ws: true, // enable websocket proxy
});

module.exports.wsProxy = wsProxy;
