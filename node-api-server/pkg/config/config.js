<<<<<<<< HEAD:node-api-server/pkg/configs/configs.js
const toml = require("toml");
const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config();
module.exports.config = toml.parse(
  fs.readFileSync(process.env.CONFIG_PATH, "utf-8")
);
========
const toml = require("toml");
const fs = require("fs");
const dotenv = require("dotenv");
delete process.env.CONFIG_PATH;
dotenv.config();


module.exports.config = toml.parse(
  fs.readFileSync(process.env.CONFIG_PATH, "utf-8")
);
>>>>>>>> origin/backend_server_v1:node-api-server/pkg/config/config.js
