const ShebangPlugin = require('webpack-shebang-plugin');
const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = {
    entry: './src/index.ts',
    target: 'node',
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
    },
    output: {
        filename: 'dataspecer',
        path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
        new ShebangPlugin(),
        new Dotenv({defaults: "./.env", path: "./.env.local"}),
    ]
};
