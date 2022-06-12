// Removes lib directory and copies the package.json file
const fs = require("fs");

fs.rmSync("./lib/", { recursive: true, force: true});
fs.mkdirSync("./lib", {recursive: true});
fs.copyFileSync("./package.json", "./lib/package.json");
