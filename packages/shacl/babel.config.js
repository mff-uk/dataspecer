module.exports = {
    presets: [
      // Compile for current version of NodeJS - CommonJS imports.
      ["@babel/preset-env", {targets: {node: 'current'}}],
      '@babel/preset-typescript',
    ],
  };