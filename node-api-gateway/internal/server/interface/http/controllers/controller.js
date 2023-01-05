class Controller {
  constructor() {
    this.Success = this.Success.bind(this);
    this.Failure = this.Failure.bind(this);
  }
}

Controller.prototype.Success = function (res, status, message, data) {
  return res.status(status).send({
    status: status,
    message: message,
    data: data,
  });
};

Controller.prototype.Failure = function (res, status, message) {
  return res.status(status).send({
    status: status,
    message: message,
    data: null,
  });
};
module.exports.Controller = Controller;
