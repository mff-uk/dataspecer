const fs = require("fs");

require("rimraf").sync("lib");
fs.mkdirSync("./lib", {recursive: true});
fs.copyFileSync("./package.json", "./lib/package.json");
