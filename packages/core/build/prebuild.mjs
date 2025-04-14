import { mkdirSync, copyFileSync } from "fs";
import { sync as rmSync } from "rimraf";

rmSync("lib");
mkdirSync("./lib", {recursive: true});
copyFileSync("./package.json", "./lib/package.json");
