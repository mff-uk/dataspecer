module.exports = {
  "verbose": true,
  "moduleFileExtensions": [
    "js",
    "ts",
  ],
  "transform": {
    "^.+\\.[t|j]sx?$": "babel-jest",
    "\\.sparql$": "jest-raw-loader",
  },
  "roots": [
    "lib",
  ],
  "testPathIgnorePatterns": [
    "./lib/bikeshed",
    "./lib/object-model",
    "./lib/respec",
    "./lib/slovník.gov.cz",
    "./lib/web-specification",
  ],
};
