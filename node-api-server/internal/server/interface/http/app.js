const handleler = require("./handler");
const route = require("./route");

module.exports.newHTTPApp = function newHTTPApp() {
  let h = handleler.newHandler();
  h.initRoute();
  return h.app;
};
