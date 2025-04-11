import { sync as rmSync } from "rimraf";
import { compileDir } from "./sparql-compiler.mjs";

rmSync("lib");
compileDir("./src", "lib");
