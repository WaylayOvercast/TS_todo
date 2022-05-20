const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { resolve } = require('path');

const tsLoaderConfig = {
    test: /\.ts(x?)$/,
    exclude: /node_modules/,
    use: 'ts-loader',
}

const styleLoaderConfig = {
    test: /\.css$/,
    exclude: /node_modules/,
    use: ['style-loader', 'css-loader']
}

const plugins = [
    new HtmlWebpackPlugin({
        template: 'src/popup/popup.html',
        filename: 'popup.html',
        chunks: ['popup'],
    }),
    new CopyPlugin({
        patterns: [
            { from: "./manifest.json", to: '.' }
        ],
    }),
    new CleanWebpackPlugin(),
];

module.exports = {
    mode: 'production',
    entry: {
        popup: './src/popup/popup.tsx'
    },
    output: {
        filename: '[name].js',
        path: resolve(__dirname, 'dist'),
    },
    module: {
        rules: [tsLoaderConfig, styleLoaderConfig],
    },
    plugins,
}