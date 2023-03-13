const express = require("express");
const limitter = require("express-rate-limit");
const compression = require("compression");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const cors = require("cors");

const { newAreaController } = require("./controller/area_controller");

const { createProxyMiddleware } = require('http-proxy-middleware');


class Handler {
  constructor() {
    this.app = express(); 
    this.initController();
    this.initMiddleware();

  }
}

Handler.prototype.initController = function() {
  this.areaController = newAreaController();
}

Handler.prototype.initMiddleware = function() {


  // const testProxy = createProxyMiddleware({ 
  //   target: 'http://' + 'node-api-server:3000', 
  //   changeOrigin: true, 
  //   ws: true,
  //   logger: console
  
  // });
  // this.app.use(testProxy);
  
  
  this.app.use(
    cors({
      origin: "*",
      credentials: true,
    })
  );
  
  this.app.use(
    limitter.rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    })
  );
  this.app.use(helmet());
  this.app.use(bodyParser.json());
  this.app.use(bodyParser.urlencoded({ extended: false }));
  
  

  this.app.use(
    compression({
      filter: function (req, res) {
        if (req.headers["x-no-compression"]) {
          // don't compress responses with this request header
          return false;
        }
  
        // fallback to standard filter function
        return compression.filter(req, res);
      },
    })
  );
}

function newHandler() {
  return new Handler();
}

module.exports.Handler = Handler;
module.exports.newHandler = newHandler;
