class Controller {
  constructor() {

  }
}

Controller.prototype.success = function(res) {
  const inner = function(status=200, message="Success", data=null) {
    return res.status(parseInt(status)).send({
      status: status,
      message: message,
      data: data
    })
  }
  return inner;
}

Controller.prototype.failure = function(res) {
  const inner = function(status=404, message="Error", data=null) {
    return res.status(parseInt(status)).send({
      status: status,
      message: message,
      data: data
    })
  }
  return inner;
}


module.exports.Controller = Controller;
