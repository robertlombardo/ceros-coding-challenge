const path              = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    devtool: 'eval-cheap-module-source-map',
    entry: './js/index.js',
    output: {
        filename: 'bundle.js'
    },
    devServer: {
        port: 8080,
        contentBase: path.join(__dirname, "dist")
    },
    node: {
        fs: 'empty'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    presets: ['env']
                }
            },
            {
                test: /\.(scss|css)$/,
                use: [
                    {
                        // creates style nodes from JS strings
                        loader: "style-loader",
                        options: {
                            sourceMap: true
                        }
                    },
                    {
                        // translates CSS into CommonJS
                        loader: "css-loader",
                        options: {
                            sourceMap: true
                        }
                    }
                ]
            },
            {
                // Load all images as base64 encoding if they are smaller than 8192 bytes
                test: /\.(png|jpg|gif)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            // On development we want to see where the file is coming from, hence we preserve the [path]
                            name: '[path][name].[ext]?hash=[hash:20]',
                            limit: 8192
                        }
                    }
                ]
            }
        ],
    },
    resolve: {
        modules: [path.resolve(__dirname, './js'), 'node_modules'],
        alias: {
            'img'    : path.join(__dirname, './assets/img'),
            'stores' : path.join(__dirname, './js/stores')
        }
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html',
            inject: true
        }),
        new CopyWebpackPlugin([
            {from: './assets', to: 'assets'}
        ]),
    ]
};
