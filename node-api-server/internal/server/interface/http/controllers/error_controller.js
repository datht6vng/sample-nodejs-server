const status = require("http-status");

const controller = require("./controller");

class ErrorController extends controller.Controller {
  constructor() {
    super();
    this.ErrorNotFound = this.ErrorNotFound.bind(this);
    this.ErrorController = this.ErrorController.bind(this);
  }
}

ErrorController.prototype.ErrorNotFound = function (req, res, next) {
  return this.Failure(res, status.NOT_FOUND, "Not found API");
};

ErrorController.prototype.ErrorController = function (err, req, res, next) {
  return this.Failure(res, err.status || status.INTERNAL_SERVER_ERROR, err);
};

function NewErrorController() {
  return new ErrorController();
}
module.exports.NewErrorController = NewErrorController;
