const client = require("prom-client");
client.collectDefaultMetrics();
class MetricsController {
  constructor() {
    this.metricsService = null;
    this.GetMetrics = this.GetMetrics.bind(this);
  }
}

MetricsController.prototype.GetMetrics = async function (req, res) {
  res.set("Content-Type", client.register.contentType);
  return res.send(await client.register.metrics());
};

function newMetricsController(service = null) {
  return new MetricsController(service);
}

module.exports.newMetricsController = newMetricsController;
