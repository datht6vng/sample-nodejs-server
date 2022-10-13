const toml = require("toml");
const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config();
module.exports.config = toml.parse(
  fs.readFileSync(process.env.CONFIG_PATH, "utf-8")
);
