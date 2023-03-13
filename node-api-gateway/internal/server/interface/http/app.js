const { newHandler } = require("./handler");
const route = require("./route");


const { config } = require("../../../../pkg/config/config");

class HttpApp {
  constructor() {
    this.handler = newHandler();
    
    this.app = this.handler.app;
    this.conf = config.server.http;

    this.handler.initRoute();

  }
}


HttpApp.prototype.start = function(host=this.conf.host, port=this.conf.port) {
  const server = this.app.listen(port, () =>
    console.log(
      `Http server is running at ${host}:${port}`
    )
  );
  return server; 
}


function newHttpApp() {
  return new HttpApp();
}

module.exports.newHttpApp = newHttpApp;
