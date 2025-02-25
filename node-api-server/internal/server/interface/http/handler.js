const express = require("express");
const limitter = require("express-rate-limit");
const compression = require("compression");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const cors = require("cors");

const healthController = require("./controller/health_controller");
const metricsController = require("./controller/metrics_controller");
const errorController = require("./controller/error_controller");

const healthSerivce = require("../../service/health_service");

class Handler {
  constructor() {
    this.app = null; // HTTP App
    // Controllers
    this.healthContronller = null;
    this.metricsController = null;
    this.errorController = null;
  }

  // Middlewares
}

function newHandler() {
  let h = new Handler();

  h.healthContronller = healthController.newHealthController(
    healthSerivce.NewHealthService()
  );
  h.metricsController = metricsController.newMetricsController(null);
  h.errorController = errorController.newErrorController();

  h.app = express();
  h.app.use(
    cors({
      origin: "*",
      credentials: true,
    })
  );

  h.app.use(
    limitter.rateLimit({
      windowMs: 1 , // 1 minutes
      max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    })
  );
  h.app.use(helmet());
  h.app.use(bodyParser.json());
  h.app.use(bodyParser.urlencoded({ extended: false }));
  h.app.use(
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

  return h;
}

module.exports.Handler = Handler;
module.exports.newHandler = newHandler;
