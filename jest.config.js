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
    "./lib/slovník.gov.cz",
  ],
};
