const handleler = require("./handler");
handleler.Handleler.prototype.InitRoute = function () {
  this.app.get("/metrics", this.metricsController.GetMetrics);
  this.app.get("/api/health", this.healthContronller.GetHealth);
};
