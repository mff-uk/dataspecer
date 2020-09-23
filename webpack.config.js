const path = require("path");

module.exports = {
  "mode": "production",
  "entry": path.join(__dirname, "src", "index.ts"),
  "target": "node",
  "output": {
    "path": path.join(__dirname, "dist"),
    "filename": "json-schema-mapping.js",
    "library": "json-schema-mapping",
    "libraryTarget": "umd"
  },
  "module": {
    "rules": [
      {
        "test": /\.(ts|js)$/,
        "exclude": /node_modules/,
        "use": [
          "babel-loader",
        ]
      }
    ]
  },
  "resolve": {
    "extensions": [".ts", ".js"],
  },
};