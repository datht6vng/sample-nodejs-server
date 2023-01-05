const handler = require("./handler");
handler.Handler.prototype.InitRoute = function () {
  this.app.get("/metrics", this.metricsController.GetMetrics);
  this.app.get("/api/health", this.healthContronller.GetHealth);


  this.app.get("/api/test", (req, res) => {
    console.log('Request received ////////////////////////');
    return res.send('1234');
  })

  // ErrorController
  this.app.use(this.errorController.ErrorNotFound);
  this.app.use(this.errorController.ErrorController);
};
