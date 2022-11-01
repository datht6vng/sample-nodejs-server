const controller = require("./controller");
const status = require("http-status");

class HealthController extends controller.Controller {
  constructor(healthService = null) {
    super();
    this.healthService = healthService;
    this.GetHealth = this.GetHealth.bind(this);
  }
}

HealthController.prototype.GetHealth = function (req, res, next) {
  try {
    message = this.healthService.GetHealth();
  } catch (err) {
    return this.Failure(
      res,
      status.INTERNAL_SERVER_ERROR,
      "Service health is bad: " + err,
      null
    );
  }
  return this.Success(res, status.OK, message, null);
};

function NewHealthController(healthService = null) {
  return new HealthController(healthService);
}

module.exports.NewHealthController = NewHealthController;
