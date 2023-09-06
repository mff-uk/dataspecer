const {defaults} = require("jest-config");
// We could print default options here.

const esModules = [
  "rdf-ext",
  "@rdfjs", // All libraries in this.
  "nodeify-fetch",
  "node-fetch",
  "data-uri-to-buffer",
  "fetch-blob",
  "formdata-polyfill",
  "is-stream",
  "duplex-to",
  "fs",
].join('|');
const ignorePatterns =  [`/node_modules/(?!${esModules})`];
module.exports = {
  "verbose": true,
  "moduleFileExtensions": [
    "js",
    "ts",
  ],
  transformIgnorePatterns: ignorePatterns,
  //"transform": {"^.+\\.[t|j]sx?$": "ts-jest" },
  "roots": [
    "src",
  ],
};
