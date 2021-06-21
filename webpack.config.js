const path = require("path");

module.exports = {
  "mode": "production",
  "entry": path.join(__dirname, "lib", "index.ts"),
  "target": "node",
  "output": {
    "path": path.join(__dirname, "dist"),
    "filename": "index.js",
    "library": "json-schema-mapping",
    "libraryTarget": "umd",
  },
  "module": {
    "rules": [
      {
        "test": /\.(ts|js)$/,
        "exclude": /node_modules/,
        "use": [
          "babel-loader",
        ],
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  "resolve": {
    "extensions": [".ts", ".js"],
  },
};