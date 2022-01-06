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
    "src",
  ],
  "testPathIgnorePatterns": [
    "./src/slovník.gov.cz",
  ],
};
