const path = require('path');

module.exports = {
    entry: './src/main.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            '_http_common': false
        }
    },
    output: {
        filename: 'backend-bundle.js',
    },
    target: 'node',
};
