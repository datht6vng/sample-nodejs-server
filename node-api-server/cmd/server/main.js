const app = require("../../internal/server/interface/http/app");
const config = require("../../pkg/configs/configs");

const httpApp = app.NewHTTPApp();

const server = httpApp.listen(config.config.server.port, () =>
  console.log(
    `Server is running at http://localhost:${config.config.server.port}`
  )
);
