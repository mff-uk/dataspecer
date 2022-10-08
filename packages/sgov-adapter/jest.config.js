module.exports = {
  "verbose": true,
  "moduleFileExtensions": [
    "js",
    "ts",
  ],
  "transform": {
    "^.+\\.[t|j]sx?$": "ts-jest",
    "\\.sparql$": "./build/sparql-loader.js",
  },
  "roots": [
    "src",
  ],
};
