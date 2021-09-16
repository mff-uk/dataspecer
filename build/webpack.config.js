const nodeExternals = require("webpack-node-externals");
const path = require("path");
const fs = require("fs");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

/**
 * Reads the lib directory and fills {@link files} object as entrypoint map
 * for webpack
 */
function readDirectory(directory, files) {
  for (const fileName of fs.readdirSync("./lib/" + directory)) {
    const moduleFileName = directory + fileName;
    const fullFileName = "./lib/" + moduleFileName;
    const type = fs.lstatSync(fullFileName);

    if (type.isDirectory()) {
      readDirectory(moduleFileName + "/", files);
    } else if (type.isFile() &&
      (moduleFileName.endsWith(".ts") || moduleFileName.endsWith(".js")) &&
      !moduleFileName.endsWith(".spec.ts")) {
      files[moduleFileName.substr(0, moduleFileName.length - 3)] = {
        "import": fullFileName,
      };
    }
  }
}

const files = {};
readDirectory("", files);

module.exports = {
  "mode": "production",
  "entry": files,
  "target": "node",
  "externals": [nodeExternals()],
  "optimization": {
    "splitChunks": {
      "chunks": "all",
      "minSize": 1024,
    },
  },
  "output": {
    "path": path.join(__dirname, "..", "dist"),
    "filename": "[name].js",
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
      }, {
        "test": /\.tsx?$/,
        "use": "ts-loader",
        "exclude": /node_modules/,
      }, {
        "test": /\.sparql$/,
        "use": "raw-loader",
      },
    ],
  },
  "resolve": {
    "extensions": [".ts", ".js", ".sparql"],
  },
  "plugins": [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      "patterns": [{
        "from": path.join(__dirname, "..", "package.json"),
        "to": path.join(__dirname, "..", "dist"),
      }],
    }),
  ],
};
