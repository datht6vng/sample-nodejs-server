const express = require("express");
const limitter = require("express-rate-limit");
const compression = require("compression");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const cors = require("cors");

const { newAreaController } = require("./controller/area_controller");
const { newCameraMapController } = require("./controller/camera_map_controller");
const { newCameraTypeController } = require("./controller/camera_type_controller");
const { newCameraController } = require("./controller/camera_controller");
const { newEventController } = require("./controller/event_controller");
const { newEventTypeController } = require("./controller/event_type_controller");
const { newIotDeviceMapController } = require("./controller/iot_device_map_controller");
const { newIotDeviceTypeController } = require("./controller/iot_device_type_controller");
const { newIotDeviceController } = require("./controller/iot_device_controller");

const { newSystemUtilityController } = require("./controller/system_utility_controller");

const { newReportController } = require("./controller/report_controller");


const { newUserController } = require("./controller/user_controller");

const { newStreamConnectionController } = require("./controller/stream_connection_controller");

const { createProxyMiddleware } = require('http-proxy-middleware');
// const { newCameraMapController } = require("./controller/camera_map_controller");

const { wsProxy } = require("../../service/proxy/websocket_proxy");

class Handler {
  constructor() {
    this.app = express(); 
    this.initController();
    this.initMiddleware();

  }
} 

Handler.prototype.initController = function() {
  this.areaController = newAreaController();
  this.cameraMapController = newCameraMapController();
  this.cameraTypeController = newCameraTypeController()
  this.cameraController = newCameraController();
  this.eventController = newEventController();
  this.eventTypeController = newEventTypeController();
  this.iotDeviceMapController = newIotDeviceMapController();
  this.iotDeviceTypeController = newIotDeviceTypeController();
  this.iotDeviceController = newIotDeviceController();

  this.systemUtilityController = newSystemUtilityController();

  this.reportControlller = newReportController();

  this.userController = newUserController();

  this.streamConnectionController = newStreamConnectionController();
}

Handler.prototype.initMiddleware = function() {


  // const testProxy = createProxyMiddleware({ 
  //   target: 'http://' + 'node-api-server:3000', 
  //   changeOrigin: true, 
  //   ws: true,
  //   logger: console
  
  // });
  // this.app.use(testProxy);
  
  this.app.use(wsProxy);
  
  this.app.use(
    cors({
      origin: "*",
      credentials: true,
    })
  );
  
  this.app.use(
    limitter.rateLimit({
      windowMs: 10000, // 10 seconds
      max: 10000, // Limit each IP to 10000 requests per `window` (here, per 10 seconds)
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    })
  );
  this.app.use(helmet());
  // this.app.use(bodyParser.json());
  // this.app.use(bodyParser.urlencoded({ extended: false }));
  this.app.use(express.json({limit: '50mb'}));
  this.app.use(express.urlencoded({limit: '50mb', extended: false}));
  
  

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
