const toml = require("toml");
const fs = require("fs");
const dotenv = require("dotenv");

let configPath = process.env.CONFIG_PATH
if (!configPath) {
  delete process.env.CONFIG_PATH;
  dotenv.config();
  configPath = process.env.CONFIG_PATH;
}
console.log("Config file:" + configPath);


module.exports.config = toml.parse(
  fs.readFileSync(configPath, "utf-8")
);
