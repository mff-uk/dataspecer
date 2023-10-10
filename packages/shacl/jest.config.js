const {defaults} = require("jest-config");
// We could print default options here.

const esModules = [
  "rdf-ext",
  //"@rdfjs", // All libraries in this.
  "@rdfjs/data-model",
  "@rdfjs/dataset",
  "@rdfjs/environment",
  "@rdfjs/fetch-lite",
  "@rdfjs/parser-n3",
  "@rdfjs/sink",
  "@rdfjs/types",
  "@rdfjs/tree",
  "@rdfjs/traverser",
  "@rdfjs/to-ntriples",
  "@rdfjs/term-set",
  "@rdfjs/term-map",
  "@rdfjs/sink-map",
  "@rdfjs/score",
  "@rdfjs/prefix-map",
  "@rdfjs/parser-jsonld",
  "@rdfjs/normalize",
  "@rdfjs/namespace",
  "@rdfjs/serializer-turtle",
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
