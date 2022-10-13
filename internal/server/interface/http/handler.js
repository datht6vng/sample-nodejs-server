const express = require("express");
const limitter = require("express-rate-limit");
const cors = require("cors");

const healthController = require("./controllers/health_controller");
const metricsController = require("./controllers/metrics_controller");

const healthSerivce = require("../../service/health_service");

class Handleler {
  constructor() {
    this.app = null; // HTTP App
    // Controllers
    this.healthContronller = null;
    this.metricsController = null;
  }

  // Middlewares
}

function NewHandler() {
  let h = new Handleler();

  h.healthContronller = healthController.NewHealthController(
    healthSerivce.NewHealthService()
  );
  h.metricsController = metricsController.NewMetricsController(null);

  h.app = express();
  h.app.use(
    cors({
      origin: "*",
      credentials: true,
    })
  );

  h.app.use(
    limitter.rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    })
  );

  return h;
}

module.exports.Handleler = Handleler;
module.exports.NewHandler = NewHandler;
