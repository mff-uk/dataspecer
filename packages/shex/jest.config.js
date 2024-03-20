const esModules = [
  "rdf-ext",
  "@rdfjs",
  "stream-chunks",
  "duplex-to",
  "grapoi",
  "nodeify-fetch",
  "node-fetch",
  "data-uri-to-buffer",
  "fetch-blob",
  "formdata-polyfill",
  "is-stream",
  "file-fetch",
  "proto-fetch",
];

module.exports = {
  "verbose": true,
  "moduleFileExtensions": [
    "js",
    "ts",
  ],
  // Default: Default: ["/node_modules/", "\\.pnp\\.[^\\\/]+$"]
  // An array of regexp pattern strings that are matched against all source
  // file paths before transformation. If the file path matches any of the
  // patterns, it will NOT be transformed.
  //
  // By default, no module in node_module is transformed as the all match
  // the default.
  //
  // We want to exclude ESModules, so they are transformed into CommonsJS.
  // Not excluding the module lead to error when: import/export is used.
  // Libraries to exclude are part of esModules variable.
  //
  // When you get error with import/export just add the library directory
  // to the esModules.
  transformIgnorePatterns: [
    `/node_modules/(?!${esModules.join("|")})`
  ],
  "roots": [
    "src",
  ],
};
