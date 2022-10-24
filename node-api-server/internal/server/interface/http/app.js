const handleler = require("./handler");
const route = require("./route");

module.exports.NewHTTPApp = function NewHTTPApp() {
  let h = handleler.NewHandler();
  h.InitRoute();
  return h.app;
};
