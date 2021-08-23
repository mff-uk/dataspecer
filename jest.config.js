module.exports = {
  "verbose": true,
  "moduleFileExtensions": [
    "js",
    "ts",
  ],
  "transform": {
    "^.+\\.[t|j]sx?$": "babel-jest",
  },
  "roots": [
    "lib",
  ],
  "testPathIgnorePatterns": [
    "./lib/bikeshed",
    "./lib/respec",
    "./lib/slovník.gov.cz",
    "./lib/web-specification",
  ],
};
